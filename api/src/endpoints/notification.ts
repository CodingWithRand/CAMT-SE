import { Router, Request, Response } from "express";
import supabase from "../db";
import { auth, uuidParam } from "../middleware";

const router = Router();
router.param("nid", uuidParam);

router.get("/notification/fetch/", auth, async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from("notifications")
        .select("id, post_id, message, is_read, created_at")
        .eq("user_id", req.userId!)
        .order("created_at", { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
});

router.post("/notification/:nid/read", auth, async (req: Request, res: Response) => {
    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", String(req.params.nid))
        .eq("user_id", req.userId!);
    if (error) throw error;
    res.status(200).send();
})

/** Mark every unread notification of the signed-in user as read. */
router.post("/notification/read-all", auth, async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", req.userId!)
        .eq("is_read", false)
        .select("id");
    if (error) throw error;
    res.status(200).json({ marked: data?.length ?? 0 });
})

export default router;
