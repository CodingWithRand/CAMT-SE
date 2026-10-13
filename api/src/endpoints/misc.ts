import { Router } from "express";
import supabase from "../db";

const router = Router();

router.get("/misc/categories", async (_req, res) => {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("priority")
        .order("category_name");
    if (error) throw error;
    res.status(200).json(data);
})

export default router;
