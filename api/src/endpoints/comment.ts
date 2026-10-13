import { Request, Response, Router } from "express";
import supabase from "../db";
import { Comment } from "../model"
import { auth, isModerator, optionalAuth, uuidParam, UUID } from "../middleware";
import { HIDDEN_POST_MESSAGE, isHidden } from "../hidden";
import { logAction } from "../modlog";
import { MESSAGES, notify, untitled } from "../notify";
import { limits } from "../rateLimit";
import { getUserData } from "../users";
import { LIMITS, text } from "../validate";
import { COMMENT_TARGET, myReactions, reactionCounts } from "../reactions";

const router = Router();
router.param("pid", uuidParam);
router.param("cid", uuidParam);

/** Comments of the given posts, each with its reaction total and the viewer's own reaction. */
async function commentsFor(pids: string[], viewerId?: string) {
    const { data, error } = await supabase
        .from("v_comments")
        .select("*")
        .in("post_id", pids);
    if (error) throw error;

    // v_comments exposes no reaction data at all, so both the totals and the
    // reader's own reaction are counted here and merged into each row.
    const ids = (data ?? []).map((c: any) => c.id);
    const [counts, mine, owners] = await Promise.all([
        reactionCounts(COMMENT_TARGET, ids),
        viewerId ? myReactions(COMMENT_TARGET, ids, viewerId) : Promise.resolve({}),
        // v_comments has no user_id; the table does, and the page needs it for edit/delete.
        viewerId && ids.length ? supabase.from("comments").select("id, user_id").in("id", ids) : Promise.resolve({ data: [] as any[] }),
    ]);
    const ownerOf = new Map(((owners as any).data ?? []).map((r: any) => [r.id, r.user_id]));
    return (data ?? []).map((c: any) => ({
        ...c,
        reaction_count: counts[c.id] ?? 0,
        my_reaction: (mine as any)[c.id] ?? null,
        is_mine: !!viewerId && ownerOf.get(c.id) === viewerId,
    }));
}

router.get("/comment/fetch/:pid", optionalAuth, async (req: Request, res: Response) => {
    res.status(200).json(await commentsFor([String(req.params.pid)], req.userId));
})

/** Comments of many posts in one request: ?pids=a,b,c (the feed used to send one request per post). */
router.get("/comment/fetch-many", optionalAuth, async (req: Request, res: Response) => {
    const pids = String(req.query.pids ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    if (!pids.length) return res.status(200).json([]);
    if (pids.length > 200) return res.status(400).json({ message: "Too many posts (max 200)" });
    if (pids.some((id) => !UUID.test(id))) return res.status(400).json({ message: "Invalid post id" });
    res.status(200).json(await commentsFor(pids, req.userId));
})

/**
 * Add a comment to post :pid, or a reply under comment :cid. Both answer with an empty 200.
 * The post's author is notified, and for a reply also the author of the comment answered
 * (never yourself, never twice).
 */
async function createComment(req: Request, res: Response) {
    const pid = String(req.params.pid);
    const content = text(req.body?.content, "content", LIMITS.comment);
    if ("error" in content) return res.status(400).json({ message: content.error });

    const { data: post, error: postError } = await supabase.from("posts").select("user_id, title, is_hidden").eq("id", pid).maybeSingle();
    if (postError) throw postError;
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.is_hidden) return res.status(403).json({ message: HIDDEN_POST_MESSAGE });

    let parentAuthor: string | null = null;
    if (req.params.cid) {
        const { data: parent, error } = await supabase.from("comments").select("user_id, post_id").eq("id", String(req.params.cid)).maybeSingle();
        if (error) throw error;
        if (!parent || parent.post_id !== pid) return res.status(404).json({ message: "Comment not found on this post" });
        parentAuthor = parent.user_id;
    }

    const comment: Comment = {
        post_id: pid,
        user_id: req.userId!,
        content: content.value,
        ...(req.params.cid ? { parent_comment_id: String(req.params.cid) } : {}),
    };
    const { error } = await supabase.from("comments").insert(comment);
    if (error) throw error;

    const who = (await getUserData(req.userId!)).display_name ?? "มีคน";
    const title = untitled(post.title);
    const rows: { user_id: string; post_id: string; message: string }[] = [];
    if (parentAuthor && parentAuthor !== req.userId) rows.push({ user_id: parentAuthor, post_id: pid, message: MESSAGES.replyToYourComment(who, title) });
    if (post.user_id !== req.userId && post.user_id !== parentAuthor) rows.push({ user_id: post.user_id, post_id: pid, message: MESSAGES.commentOnYourPost(who, title) });
    await notify(rows);
    res.status(200).send();
}

router.post("/comment/:pid", auth, limits.comment, createComment);
router.post("/comment/:pid/replyto/:cid", auth, limits.comment, createComment);

router.post("/comment/:cid/react", auth, limits.react, async (req: Request, res: Response) => {
    const { cid } = req.params;
    const { reaction_type, change } = req.body;
    const { data: comment } = await supabase.from("comments").select("post_id").eq("id", String(req.params.cid)).maybeSingle();
    if (comment && await isHidden(comment.post_id)) return res.status(403).json({ message: HIDDEN_POST_MESSAGE });
    const { data, error } = await supabase.rpc("react_to_comment", {
        cid,
        uid: req.userId,
        rtype: reaction_type,
        change_reaction: change || false
    })
    if(error) throw error;
    res.status(200).json(data); // reaction count send to the frontend.
})

/** Edit your own comment. */
router.put("/comment/:cid", auth, async (req: Request, res: Response) => {
    const cid = String(req.params.cid);
    const parsed = text(req.body?.content, "content", LIMITS.comment);
    if ("error" in parsed) return res.status(400).json({ message: parsed.error });
    const content = parsed.value;
    const { data: c, error } = await supabase.from("comments").select("id, user_id, post_id").eq("id", cid).maybeSingle();
    if (error) throw error;
    if (!c) return res.status(404).json({ message: "Comment not found" });
    if (c.user_id !== req.userId) return res.status(403).json({ message: "You can only edit your own comments" });
    if (await isHidden(c.post_id)) return res.status(403).json({ message: HIDDEN_POST_MESSAGE });
    const { error: e2 } = await supabase.from("comments").update({ content }).eq("id", cid);
    if (e2) throw e2;
    res.status(200).json({ id: cid, post_id: c.post_id, content });
})

/** Delete a comment (its author, or a moderator), together with the replies under it. */
router.delete("/comment/:cid", auth, async (req: Request, res: Response) => {
    const cid = String(req.params.cid);
    const { data: c, error } = await supabase.from("comments").select("id, user_id, post_id").eq("id", cid).maybeSingle();
    if (error) throw error;
    if (!c) return res.status(404).json({ message: "Comment not found" });
    const asMod = c.user_id !== req.userId;
    if (asMod && !(await isModerator(req.userId))) {
        return res.status(403).json({ message: "Only the author or a moderator can delete this comment" });
    }

    // Collect the whole thread below it (replies, replies to replies, ...).
    const ids = [cid];
    for (let frontier = [cid]; frontier.length; ) {
        const { data: kids, error: kErr } = await supabase.from("comments").select("id").in("parent_comment_id", frontier);
        if (kErr) throw kErr;
        frontier = (kids ?? []).map((k) => k.id);
        ids.push(...frontier);
    }
    const r1 = await supabase.from("comment_reactions").delete().in("comment_id", ids);
    if (r1.error) throw r1.error;
    // Deepest first, so no reply is left pointing at a removed parent.
    for (const id of [...ids].reverse()) {
        const r = await supabase.from("comments").delete().eq("id", id);
        if (r.error) throw r.error;
    }
    if (asMod) {
        const { data: post } = await supabase.from("posts").select("title").eq("id", c.post_id).maybeSingle();
        await logAction(req.userId!, "comment_deleted", { post_id: c.post_id, post_title: post?.title, target_id: cid, detail: ids.length > 1 ? `${ids.length} ความเห็นรวมการตอบกลับ` : null });
    }
    res.status(200).json({ id: cid, post_id: c.post_id, deleted: ids.length });
})

export default router;