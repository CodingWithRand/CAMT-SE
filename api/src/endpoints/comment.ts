import { Request, Response, Router } from "express";
import supabase from "../db";
import { Comment } from "../model"
import { auth, isModerator, optionalAuth, uuidParam, UUID } from "../middleware";
import { HIDDEN_POST_MESSAGE, isHidden } from "../hidden";

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

/** Add a comment to post :pid, or a reply under comment :cid. Both answer with an empty 200. */
async function createComment(req: Request, res: Response) {
    const pid = String(req.params.pid);
    if (await isHidden(pid)) return res.status(403).json({ message: HIDDEN_POST_MESSAGE });
    const comment: Comment = {
        post_id: pid,
        user_id: req.userId!,
        content: req.body.content,
        ...(req.params.cid ? { parent_comment_id: String(req.params.cid) } : {}),
    };
    const { error } = await supabase.from("comments").insert(comment);
    if (error) throw error;
    res.status(200).send();
}

router.post("/comment/:pid", auth, createComment);
router.post("/comment/:pid/replyto/:cid", auth, createComment);

router.post("/comment/:cid/react", auth, async (req: Request, res: Response) => {
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

const MAX_COMMENT = 1000;

/** Edit your own comment. */
router.put("/comment/:cid", auth, async (req: Request, res: Response) => {
    const cid = String(req.params.cid);
    const content = String(req.body?.content ?? "").trim();
    if (!content || content.length > MAX_COMMENT) return res.status(400).json({ message: `Comment must be 1-${MAX_COMMENT} characters` });
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
    if (c.user_id !== req.userId && !(await isModerator(req.userId))) {
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
    res.status(200).json({ id: cid, post_id: c.post_id, deleted: ids.length });
})

export default router;