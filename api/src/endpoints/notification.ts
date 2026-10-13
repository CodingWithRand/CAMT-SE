import { Router, Request, Response } from "express";
import supabase from "../db";
import { auth, uuidParam } from "../middleware";

const router = Router();
router.param("nid", uuidParam);

router.get("/notification/fetch/", auth, async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from("notifications")
            .select("id, post_id, message, is_read, created_at")
            .eq("user_id", req.userId)
            .order("created_at", { ascending: false });
        if(error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
});

router.post("/notification/:nid/read", auth, async (req: Request, res: Response) => {
    const { nid } = req.params;
    try {
        const { data, error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", nid)
            .eq("user_id", req.userId)
            .select();
        if(error) throw error;
        res.status(200).send();
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

export default router;
