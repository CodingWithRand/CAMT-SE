import { Request, Response, Router } from "express";
import supabase from "../db";
import { Report } from "../model";

const router = Router();

router.get("/report/fetch", async (req: Request, res: Response) => {
    try {
        // SELECT * FROM reports;
        const { data, error } = await supabase
            .from("reports")
            .select("*");
        if(error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
});

router.post("/report/createticket", async (req: Request, res: Response) => {
    const reportData: Report = {
        post_id: req.body.post_id,
        user_id: req.body.user_id,
        reason: req.body.reason,
        status: "Open"
    }
    try {
        // INSERT INTO reports (post_id, user_id, reason, status) VALUES (pid, uid, reason, status);
        const { data, error } = await supabase
            .from("reports")
            .insert(reportData)
            .select();
        if(error) throw error;
        res.status(200).send();
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
});

router.put("/report/update/:rid", async (req: Request, res: Response) => {
    const { rid } = req.params;
    const { status, reviewer } = req.body;

    // reviewer is uid btw. considering removing it and let any mod review freely.
    // if (reviewer !== req.userId) res.status(401).json({ message: "You are not allowed to review this report." });

    try {
        // UPDATE reports SET status = status WHERE id = rid;
        const { data, error } = await supabase
            .from("reports")
            .update({ status, reviewed_at: new Date() })
            .eq("id", rid)
            .select();
        if(error) throw error;
        res.status(200).send();
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

export default router;