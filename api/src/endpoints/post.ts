import { Request, Response, Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { Post } from "../model";
import supabase from "../db";
import path from "path";

const router = Router();
const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: multer.memoryStorage(),
})

async function uploadPostMedia(pid: Post['id'], m: any, mt: "images" | "videos") {
    // Generate file hash and path
    const filehash = crypto
        .createHash('md5')
        .update(m.buffer)
        .digest('hex');
    const ext = path.extname(m.originalname);
    const fileName = `/${parseInt(pid)}/${mt}s/${filehash}${ext}`;
    const { data, error } = await supabase.storage
        .from('post_medias')
        .upload(fileName, m.buffer, {
            contentType: m.mimetype,
            upsert: true
        });
    if(error) throw error;
    return data;
}

router.post("/post/create", 
    upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 1 }]), 
    async (req: Request, res: Response) => {
    const { id, user_id, content, is_important, category_id }: Post = req.body;

    // const postdata: Post = req.body;
    try {
        // INSERT INTO posts VALUES(id, user_id, content, is_important);
        const { data, error } = await supabase
            .from('posts')
            .insert({ id, user_id, content, is_important })
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
        
        if(req.files) {
            const uploadedImgs = await Promise.all(req.files?['images']: [].map((img) => uploadPostMedia(id, img, "images")));
            const uploadedVids = await Promise.all(req.files?['images']: [].map((img) => uploadPostMedia(id, img, "videos")));

            const imgsURL = uploadedImgs.map((img) => {
                // Get public URL
                const { data: { publicUrl } } = supabase!.storage
                    .from('post_medias')
                    .getPublicUrl((img as any).path);
                return publicUrl;
            })

            const vidsURL = uploadedVids.map((vid) => {
                // Get public URL
                const { data: { publicUrl } } = supabase!.storage
                    .from('post_medias')
                    .getPublicUrl((vid as any).path);
                return publicUrl;
            })

            const { data: data2, error: error2 } = await supabase
                .from('posts')
                .update({ media: [...imgsURL, ...vidsURL] })
                .eq('id', id);
            
            if (error2) throw error2;
        }

    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
    res.status(200).send();
})

router.get("/post/fetch", async (req: Request, res: Response) => {
    try {
        // SELECT * FROM posts ORDER BY posts.created_at DESC LIMIT 5
        const { data: normalpost, error: error2 } = await supabase
            .from('v_post_all_data')
            .select("*")
            .order('created_at', { ascending: false })
            .limit(5);
        if (error2) throw error2;
        res.status(200).json(normalpost);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.get("/post/fetch/announcement", async (req: Request, res: Response) => {
    try {
        const { data: announcement, error: error1 } = await supabase
            .from('v_post_all_data')
            .select("*")
            .eq('is_important', true)
            .order('created_at', { ascending: false })
            .limit(5);
        if (error1) throw error1;
        res.status(200).json(announcement);
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
router.post("/post/:pid/react", async (req: Request, res: Response) => {
    const { pid } = req.params;
    const { reaction_type } = req.body;
    try {
        const { data, error } = await supabase.rpc("react_to_post", {
            pid,
            uid: req.userId,
            rtype: reaction_type
        })
        if(error) throw error;
        res.status(200).json(data); // reaction count send to the frontend.
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

// router.post("/post/search/category", async (req: Request, res: Response) => {
    
// }) 

export default router;
