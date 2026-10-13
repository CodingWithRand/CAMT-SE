import { Request, Response, Router } from "express";
import supabase from "../db";
import { auth, requireMod, uuidParam } from "../middleware";
import { logAction } from "../modlog";
import { MESSAGES, notify, untitled } from "../notify";

/** Moderators hide and unhide posts. (Report decisions are in report.ts.) */
const router = Router();
router.param("pid", uuidParam);

/**
 * Hide a post. It leaves the feed but keeps its reports, which are closed as Reviewed;
 * the reporters and the author are told.
 */
router.put("/post/:pid/hide", auth, requireMod, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    const reason = String(req.body?.reason ?? "").trim().slice(0, 300) || null;

    const { data: post, error } = await supabase
        .from("posts")
        .update({ is_hidden: true, hidden_at: new Date(), hidden_by: req.userId, hidden_reason: reason })
        .eq("id", pid)
        .select("id, user_id, title")
        .maybeSingle();
    if (error) throw error;
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { data: closed, error: reportError } = await supabase
        .from("reports")
        .update({ status: "Reviewed", reviewed_by: req.userId, reviewed_at: new Date() })
        .eq("post_id", pid)
        .eq("status", "Open")
        .select("user_id");
    if (reportError) throw reportError;

    const title = untitled(post.title);
    const reporters = [...new Set((closed ?? []).map((r) => r.user_id))].filter((u) => u !== post.user_id);
    await notify([
        ...reporters.map((user_id) => ({ user_id, post_id: pid, message: MESSAGES.reportedPostHidden(title) })),
        { user_id: post.user_id, post_id: pid, message: MESSAGES.yourPostHidden(title, reason) },
    ]);

    await logAction(req.userId!, "post_hidden", { post_id: pid, post_title: post.title, detail: reason });
    res.status(200).json({ id: pid, is_hidden: true, hidden_reason: reason, reports_closed: closed?.length ?? 0 });
})

/** Every hidden post, including ones hidden without any report. */
router.get("/post/hidden", auth, requireMod, async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from("posts")
        .select("id, title, hidden_reason, hidden_at, author:users!posts_user_id_fkey(display_name)")
        .eq("is_hidden", true)
        .order("hidden_at", { ascending: false });
    if (error) throw error;
    res.status(200).json(data ?? []);
})

/** Show a hidden post again. Its reports keep the status they have. */
router.put("/post/:pid/unhide", auth, requireMod, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    const { data: post, error } = await supabase
        .from("posts")
        .update({ is_hidden: false, hidden_at: null, hidden_by: null, hidden_reason: null })
        .eq("id", pid)
        .select("id, user_id, title")
        .maybeSingle();
    if (error) throw error;
    if (!post) return res.status(404).json({ message: "Post not found" });

    await notify([{ user_id: post.user_id, post_id: pid, message: MESSAGES.yourPostRestored(untitled(post.title)) }]);
    await logAction(req.userId!, "post_unhidden", { post_id: pid, post_title: post.title });
    res.status(200).json({ id: pid, is_hidden: false });
})

export default router;
