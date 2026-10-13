import { Router } from "express";
import supabase from "../db";

const router = Router();

router.get("/misc/categories", async (_req, res) => {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("priority")
        .order("category_name");
    if (error) throw error;
    // How many people follow each category (counts only), for "popular" hints when choosing.
    const { data: follows, error: e2 } = await supabase.from("user_interests").select("category_id");
    if (e2) throw e2;
    const count = new Map<string, number>();
    for (const f of follows ?? []) count.set(f.category_id, (count.get(f.category_id) ?? 0) + 1);
    res.status(200).json((data ?? []).map((c) => ({ ...c, follower_count: count.get(c.id) ?? 0 })));
})

export default router;
