import { Request, Response, Router } from "express";
import supabase from "../db";
import { Comment } from "../model"
import { auth, optionalAuth, uuidParam, UUID } from "../middleware";
import { HIDDEN_POST_MESSAGE, isHidden } from "../hidden";
import {
    COMMENT_TARGET, REACTION_TYPES, isReactionType, myReactions, reactionCounts, setReaction,
} from "../reactions";

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
    const [counts, mine] = await Promise.all([
        reactionCounts(COMMENT_TARGET, ids),
        viewerId ? myReactions(COMMENT_TARGET, ids, viewerId) : Promise.resolve({}),
    ]);
    return (data ?? []).map((c: any) => ({
        ...c,
        reaction_count: counts[c.id] ?? 0,
        my_reaction: (mine as any)[c.id] ?? null,
    }));
}

router.get("/comment/fetch/:pid", optionalAuth, async (req: Request, res: Response) => {
    try {
        res.status(200).json(await commentsFor([String(req.params.pid)], req.userId));
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

/** Comments of many posts in one request: ?pids=a,b,c (the feed used to send one request per post). */
router.get("/comment/fetch-many", optionalAuth, async (req: Request, res: Response) => {
    const pids = String(req.query.pids ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    if (!pids.length) return res.status(200).json([]);
    if (pids.length > 200) return res.status(400).json({ message: "Too many posts (max 200)" });
    if (pids.some((id) => !UUID.test(id))) return res.status(400).json({ message: "Invalid post id" });
    try {
        res.status(200).json(await commentsFor(pids, req.userId));
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.post("/comment/:pid", auth, async (req: Request, res: Response) => {
    const { pid } = req.params;
    const commentData: Comment = {
        post_id: pid as string,
        user_id: req.userId!,
        content: req.body.content
    };
    try {
        if (await isHidden(String(req.params.pid))) return res.status(403).json({ message: HIDDEN_POST_MESSAGE });
        // INSERT INTO comments (post_id, user_id, content) VALUES (pid, uid, content);
        const { data, error } = await supabase
            .from("comments")
            .insert(commentData)
            .select();
        if(error) throw error;
        res.status(200).send();
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.post("/comment/:pid/replyto/:cid", auth, async (req: Request, res: Response) => {
    const { pid, cid } = req.params;
    const commentData: Comment = {
        parent_comment_id: cid as string,
        post_id: pid as string,
        user_id: req.userId!,
        content: req.body.content
    };
    try {
        if (await isHidden(String(req.params.pid))) return res.status(403).json({ message: HIDDEN_POST_MESSAGE });
        // INSERT INTO comments (parent_comment_id, post_id, user_id, content) VALUES (cid, pid, uid, content);
        const { data, error } = await supabase
            .from("comments")
            .insert(commentData)
            .select();
        if(error) throw error;
        res.status(200).send();
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

// RPC this one.
router.post("/comment/:cid/react", auth, async (req: Request, res: Response) => {
    const { cid } = req.params;
    const { reaction_type, change } = req.body;
    try {
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
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

// router.post("/comment/:cid/react", auth, async (req: Request, res: Response) => {
//     const { cid } = req.params;
//     const { reaction_type } = req.body;

//     if (reaction_type !== null && !isReactionType(reaction_type)) {
//         return res.status(400).json({
//             message: `reaction_type must be null or one of: ${REACTION_TYPES.join(", ")}`,
//         });
//     }

//     try {
//         const result = await setReaction(COMMENT_TARGET, cid as string, req.userId!, reaction_type);
//         res.status(200).json(result); // { reaction_count, my_reaction }
//     } catch (error: any) {
//         res.status(500).json({ code: error?.code, message: error?.message });
//     }
// })

export default router;