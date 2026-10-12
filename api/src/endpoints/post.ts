import { Request, Response, Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { Post } from "../model";
import supabase from "../db";
import path from "path";
import { auth, optionalAuth } from "../middleware";
import { getUserData } from "./user";
import {
    POST_TARGET, REACTION_TYPES, isReactionType, myReactions, setReaction,
} from "../reactions";

const router = Router();
const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: multer.memoryStorage(),
})

async function uploadPostMedia(pid: Post['id'], m: Express.Multer.File, mt: "image" | "video") {
    // Generate file hash and path
    const filehash = crypto
        .createHash('md5')
        .update(m.buffer)
        .digest('hex');
    const ext = path.extname(m.originalname).toLowerCase();
    const fileName = `${pid}/${mt}s/${filehash}${ext}`;
    const { data, error } = await supabase.storage
        .from('post_medias')
        .upload(fileName, m.buffer, {
            contentType: m.mimetype,
            upsert: true
        });
    if(error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('post_medias')
        .getPublicUrl(data.path);
    return { post_id: pid, file_url: publicUrl, media_type: mt };
}

router.post("/post/create", 
    auth,
    upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 1 }]), 
    async (req: Request, res: Response) => {
    const { title, content } = req.body;

    // multipart/form-data sends everything as text: a lone category_id arrives as
    // a string instead of an array, and is_important as "true" / "false".
    const category_id: string[] = [req.body.category_id ?? []].flat();
    const is_important = req.body.is_important === true || req.body.is_important === "true";

    const files = (req.files ?? {}) as { [field: string]: Express.Multer.File[] };
    const images = files['images'] ?? [];
    const videos = files['videos'] ?? [];

    // Checked before anything is written, so a bad request leaves no half-made post behind.
    if (category_id.length === 0) return res.status(400).json({ message: "At least one category is required." });
    if (images.some((img) => !img.mimetype.startsWith("image/"))) return res.status(400).json({ message: "images must be image files." });
    if (videos.some((vid) => !vid.mimetype.startsWith("video/"))) return res.status(400).json({ message: "videos must be video files." });

    // const postdata: Post = req.body;
    try {
        // INSERT INTO posts VALUES(id, user_id, title, content, is_important);
        const { data, error } = await supabase
            .from('posts')
            .insert({ user_id: req.userId, title, content, is_important })
            // .insert(postdata)
            .select()
            .single();
        
        if (error) throw error;

        // INSERT INTO post_categories VALUES(pid, cid);
        const { data: cd, error: cderr } = await supabase
            .from('post_categories')
            .insert(category_id.map((cid) => ({ post_id: data.id, category_id: cid })))
            .select();
        
        if (cderr) throw cderr;
        
        if (images.length || videos.length) {
            const uploaded = await Promise.all([
                ...images.map((img) => uploadPostMedia(data.id, img, "image")),
                ...videos.map((vid) => uploadPostMedia(data.id, vid, "video")),
            ]);

            // INSERT INTO media (post_id, file_url, media_type) VALUES (pid, url, type);
            const { error: mderr } = await supabase
                .from('media')
                .insert(uploaded);
            
            if (mderr) throw mderr;
        }

        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

/**
 * v_post_all_data carries the total reaction_count but nothing about who
 * reacted, so a signed-in reader's own reaction is stitched on here in one
 * extra query. Logged-out readers just get my_reaction: null.
 *
 * It cannot live in the view: the API connects with the service_role key, so
 * auth.uid() inside a view is always NULL and only this layer knows the caller.
 */
async function withMyReaction(posts: any[], userId?: string) {
    if (!userId || !posts?.length) {
        return (posts ?? []).map((p) => ({ ...p, my_reaction: null }));
    }
    const mine = await myReactions(POST_TARGET, posts.map((p) => p.id), userId);
    return posts.map((p) => ({ ...p, my_reaction: mine[p.id] ?? null }));
}

router.get("/post/fetch", optionalAuth, async (req: Request, res: Response) => {
    try {
        // SELECT * FROM posts ORDER BY posts.created_at DESC LIMIT 5
        const { data: normalpost, error: error2 } = await supabase
            .from('v_post_all_data')
            .select("*")
            .order('created_at', { ascending: false })
            // .limit(5);
        if (error2) throw error2;
        res.status(200).json(await withMyReaction(normalpost ?? [], req.userId));
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.get("/post/fetch/categories", auth, async (req: Request, res: Response) => {
    const { category_id } = req.body; // array of category_ids

    try {
        const { data, error } = await supabase.rpc('get_post_from_cate', {
            cate_id: category_id
        })
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.get("/post/fetch/announcement", optionalAuth, async (req: Request, res: Response) => {
    try {
        const { data: announcement, error: error1 } = await supabase
            .from('v_post_all_data')
            .select("*")
            .eq('is_important', true)
            .order('created_at', { ascending: false })
            .limit(5);
        if (error1) throw error1;
        res.status(200).json(await withMyReaction(announcement ?? [], req.userId));
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.get("/post/fetch/notification", async (req: Request, res: Response) => {
    try {
        const { data: announcement, error: error1 } = await supabase
            .from('v_notification') // post + notification
            .select("*")
            .order('notified_at', { ascending: false })
            .limit(5);
        if (error1) throw error1;
        res.status(200).json(announcement);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

// RPC this one.
router.post("/post/:pid/react", auth, async (req: Request, res: Response) => {
    const { pid } = req.params;
    const { reaction_type, change } = req.body;
    try {
        const { data, error } = await supabase.rpc("react_to_post", {
            pid,
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

router.put("/post/:pid/edit", auth, async (req: Request, res: Response) => {
    const { pid } = req.params;
    const { title, content, is_important, category_names } = req.body;

    try {
        const userData = await getUserData(req.userId!);
        if(!userData.is_mod) return res.status(403).json({ message: "Only mods are allowed edit posts." });

        const { data, error } = await supabase
            .from('posts')
            .update({ title, content, is_important })
            .eq('id', pid)
            .select()
        if (error) throw error;
        // INSERT INTO post_categories VALUES(pid, cid);

        // rpc update post_cate

        const { data: cd, error: cderr } = await supabase
            .rpc('update_post_cate', {
                pid,
                cate_name: category_names
            })
        
        if (cderr) throw cderr;
        res.status(200).send();
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.delete("/post/:pid/delete", auth, async (req: Request, res: Response) => {
    const { pid } = req.params;
    try {
        const userData = await getUserData(req.userId!);
        if(!userData.is_mod) return res.status(403).json({ message: "Only mods are allowed delete posts." });

        const { data, error } = await supabase
            .from('posts')
            .delete()
            .eq('id', pid)
            .select();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

export default router;
