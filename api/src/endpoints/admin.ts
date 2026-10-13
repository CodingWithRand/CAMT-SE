import { Request, Response, Router } from "express";
import supabase from "../db";
import { auth, requireMod, uuidParam } from "../middleware";
import { logAction } from "../modlog";

/** Moderator tools: manage categories, and give or take away the moderator role. */
const router = Router();
router.param("catId", uuidParam);
router.param("uid", uuidParam);

const MAX_NAME = 40;
const MAX_DESCRIPTION = 160;
const PRIORITIES = [1, 2, 3];   // 1 = most important (shown highlighted), 3 = general

function readCategory(body: any, partial: boolean) {
    const out: { category_name?: string; description?: string | null; priority?: number } = {};
    if (!partial || body?.name !== undefined) {
        const name = String(body?.name ?? "").trim().replace(/\s+/g, " ");
        if (!name || name.length > MAX_NAME) return { error: `Name is required (max ${MAX_NAME} characters)` };
        out.category_name = name;
    }
    if (body?.description !== undefined) {
        const d = String(body.description ?? "").trim();
        if (d.length > MAX_DESCRIPTION) return { error: `Description is too long (max ${MAX_DESCRIPTION})` };
        out.description = d || null;
    }
    if (!partial || body?.priority !== undefined) {
        const p = Number(body?.priority ?? 3);
        if (!PRIORITIES.includes(p)) return { error: "Priority must be 1, 2 or 3" };
        out.priority = p;
    }
    return { value: out };
}

async function nameTaken(name: string, exceptId?: string) {
    const { data, error } = await supabase.from("categories").select("id").ilike("category_name", name);
    if (error) throw error;
    return (data ?? []).some((c) => c.id !== exceptId);
}

/** Categories with how many posts use each and how many people follow it. */
router.get("/admin/categories", auth, requireMod, async (_req: Request, res: Response) => {
    const [{ data: cats, error }, { data: pc, error: e2 }, { data: ui, error: e3 }] = await Promise.all([
        supabase.from("categories").select("*").order("priority").order("category_name"),
        supabase.from("post_categories").select("category_id"),
        supabase.from("user_interests").select("category_id"),
    ]);
    if (error || e2 || e3) throw error || e2 || e3;
    const count = (rows: { category_id: string }[] | null) =>
        (rows ?? []).reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.category_id]: (acc[r.category_id] ?? 0) + 1 }), {});
    const posts = count(pc), followers = count(ui);
    res.status(200).json((cats ?? []).map((c) => ({ ...c, post_count: posts[c.id] ?? 0, follower_count: followers[c.id] ?? 0 })));
})

router.post("/admin/categories", auth, requireMod, async (req: Request, res: Response) => {
    const parsed = readCategory(req.body, false);
    if ("error" in parsed) return res.status(400).json({ message: parsed.error });
    if (await nameTaken(parsed.value.category_name!)) return res.status(409).json({ message: "A category with this name already exists" });
    const { data, error } = await supabase.from("categories").insert(parsed.value).select().single();
    if (error) throw error;
    await logAction(req.userId!, "category_created", { target_id: data.id, detail: data.category_name });
    res.status(201).json(data);
})

router.put("/admin/categories/:catId", auth, requireMod, async (req: Request, res: Response) => {
    const id = String(req.params.catId);
    const parsed = readCategory(req.body, true);
    if ("error" in parsed) return res.status(400).json({ message: parsed.error });
    if (parsed.value.category_name && await nameTaken(parsed.value.category_name, id)) {
        return res.status(409).json({ message: "A category with this name already exists" });
    }
    const { data, error } = await supabase.from("categories").update(parsed.value).eq("id", id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Category not found" });
    await logAction(req.userId!, "category_updated", { target_id: id, detail: data.category_name });
    res.status(200).json(data);
})

/** Delete a category that no post uses (otherwise those posts would lose it). Followers are dropped. */
router.delete("/admin/categories/:catId", auth, requireMod, async (req: Request, res: Response) => {
    const id = String(req.params.catId);
    const { count, error } = await supabase.from("post_categories").select("*", { count: "exact", head: true }).eq("category_id", id);
    if (error) throw error;
    if (count) return res.status(409).json({ message: "Category is still used by posts", post_count: count });

    const r1 = await supabase.from("user_interests").delete().eq("category_id", id);
    if (r1.error) throw r1.error;
    const { data, error: e2 } = await supabase.from("categories").delete().eq("id", id).select("id, category_name");
    if (e2) throw e2;
    if (!data?.length) return res.status(404).json({ message: "Category not found" });
    await logAction(req.userId!, "category_deleted", { target_id: id, detail: data[0]?.category_name });
    res.status(200).json({ id, deleted: true });
})

/** Users for the role page: search by name or email (moderators may see emails). */
router.get("/admin/users", auth, requireMod, async (req: Request, res: Response) => {
    const q = String(req.query.q ?? "").trim().replace(/[%,()]/g, "");
    let query = supabase.from("users").select("id, display_name, email, is_mod, is_cmu_p, created_at").order("is_mod", { ascending: false }).order("display_name").limit(50);
    if (q) query = query.or(`display_name.ilike.%${q}%,email.ilike.%${q}%`);
    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json(data ?? []);
})

/**
 * Give or take away the moderator role. Not on yourself, never leaving the site without a moderator,
 * and only for CMU staff: the database enforces that with chk_mod_requires_cmup (is_mod needs is_cmu_p).
 */
router.put("/admin/users/:uid/role", auth, requireMod, async (req: Request, res: Response) => {
    const uid = String(req.params.uid);
    if (typeof req.body?.is_mod !== "boolean") return res.status(400).json({ message: "is_mod must be true or false" });
    const is_mod: boolean = req.body.is_mod;
    if (uid === req.userId) return res.status(400).json({ message: "You cannot change your own role" });
    if (is_mod) {
        const { data: target, error } = await supabase.from("users").select("is_cmu_p").eq("id", uid).maybeSingle();
        if (error) throw error;
        if (!target) return res.status(404).json({ message: "User not found" });
        if (!target.is_cmu_p) return res.status(409).json({ code: "not_staff", message: "Only CMU staff (is_cmu_p) can be moderators" });
    } else {
        const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("is_mod", true);
        if (error) throw error;
        if ((count ?? 0) <= 1) return res.status(409).json({ message: "At least one moderator must remain" });
    }
    const { data, error } = await supabase.from("users").update({ is_mod }).eq("id", uid).select("id, display_name, is_mod").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "User not found" });
    await logAction(req.userId!, is_mod ? "role_granted" : "role_revoked", { target_id: uid, detail: data.display_name });
    res.status(200).json(data);
})

export default router;
