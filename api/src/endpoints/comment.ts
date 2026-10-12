import { Request, Response, Router } from "express";
import supabase from "../db";
import { Comment } from "../model"
import { auth, optionalAuth } from "../middleware";
import {
    COMMENT_TARGET, REACTION_TYPES, isReactionType, myReactions, reactionCounts, setReaction,
} from "../reactions";

const router = Router();

router.get("/comment/fetch/:pid", optionalAuth, async (req: Request, res: Response) => {
    const { pid } = req.params;
    try {
        // SELECT * FROM comments WHERE id = cid;
        const { data, error } = await supabase
            .from("v_comments")
            .select("*")
            .eq("post_id", pid);
        if(error) throw error;

        // v_comments exposes no reaction data at all, so both the totals and the
        // reader's own reaction are counted here and merged into each row.
        const ids = (data ?? []).map((c: any) => c.id);
        const [counts, mine] = await Promise.all([
            reactionCounts(COMMENT_TARGET, ids),
            req.userId ? myReactions(COMMENT_TARGET, ids, req.userId) : Promise.resolve({}),
        ]);
        res.status(200).json((data ?? []).map((c: any) => ({
            ...c,
            reaction_count: counts[c.id] ?? 0,
            my_reaction: (mine as any)[c.id] ?? null,
        })));
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