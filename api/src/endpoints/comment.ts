import { Request, Response, Router } from "express";
import supabase from "../db";
import { Comment } from "../model"

const router = Router();

router.get("/comment/fetch/:cid", async (req: Request, res: Response) => {
    const { cid } = req.params;
    try {
        // SELECT * FROM comments WHERE id = cid;
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("id", cid);
        if(error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.post("/comment/:pid", async (req: Request, res: Response) => {
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

router.post("/comment/:pid/replyto/:cid", async (req: Request, res: Response) => {
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
router.post("/comment/:cid/react", async (req: Request, res: Response) => {
    const { cid } = req.params;
    const { reaction_type } = req.body;
    try {
        const { data, error } = await supabase.rpc("react_to_comment", {
            cid,
            uid: req.userId,
            rtype: reaction_type
        })
        if(error) throw error;
        res.status(200).json(data); // reaction count send to the frontend.
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

export default router;