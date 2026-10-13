import { Router, Request, Response } from "express";
import supabase from "../db";

const router = Router();

router.get("/misc/categories", async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select("*")
            .order("priority")
            .order("category_name")

        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

export default router;