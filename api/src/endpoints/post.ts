import { Request, Response, Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { Post } from "../model";
import supabase from "../db";
import path from "path";
import { auth, optionalAuth, uuidParam } from "../middleware";
import { getUserData } from "./user";
import { HIDDEN_POST_MESSAGE, hiddenPosts, isHidden, isMissingColumn, withoutHidden } from "../hidden";
import {
    POST_TARGET, REACTION_TYPES, isReactionType, myReactions, setReaction,
} from "../reactions";

const router = Router();
router.param("pid", uuidParam);
const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: multer.memoryStorage(),
})

/**
 * Add what v_post_all_data lacks: whether the viewer wrote the post (so the page offers
 * edit and delete), and whether it was edited and by whom (for the "edited" label).
 */
async function withOwnership<T extends { id: string }>(rows: T[], viewerId?: string) {
    if (!rows.length) return rows.map((r) => ({ ...r, is_mine: false }));
    const ids = rows.map((r) => r.id);
    let res: { data: any[] | null; error: any } = await supabase.from("posts").select("id, user_id, edited_at, edited_by").in("id", ids);
    // edited_* come from api/sql/2026-10-13_post_edits.sql; without it, skip the label.
    if (res.error && isMissingColumn(res.error)) res = await supabase.from("posts").select("id, user_id").in("id", ids);
    if (res.error) throw res.error;
    const meta = new Map((res.data ?? []).map((p: any) => [p.id, p]));
    return rows.map((r) => {
        const m = meta.get(r.id);
        return {
            ...r,
            is_mine: !!viewerId && m?.user_id === viewerId,
            edited_at: m?.edited_at ?? null,
            edited_by_mod: !!m?.edited_at && !!m?.edited_by && m.edited_by !== m.user_id,
        };
    });
}

/** Who may change a post: its author, or any moderator. */
async function postAccess(pid: string, userId: string) {
    const { data: post, error } = await supabase.from("posts").select("id, user_id").eq("id", pid).maybeSingle();
    if (error) throw error;
    if (!post) return { exists: false, isOwner: false, isMod: false };
    const isOwner = post.user_id === userId;
    const isMod = !isOwner && !!(await getUserData(userId)).is_mod;
    return { exists: true, isOwner, isMod };
}

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
    const wantsAnnouncement = req.body.is_important === true || req.body.is_important === "true";

    const files = (req.files ?? {}) as { [field: string]: Express.Multer.File[] };
    const images = files['images'] ?? [];
    const videos = files['videos'] ?? [];

    // Checked before anything is written, so a bad request leaves no half-made post behind.
    if (category_id.length === 0) return res.status(400).json({ message: "At least one category is required." });
    if (images.some((img) => !img.mimetype.startsWith("image/"))) return res.status(400).json({ message: "images must be image files." });
    if (videos.some((vid) => !vid.mimetype.startsWith("video/"))) return res.status(400).json({ message: "videos must be video files." });

    // const postdata: Post = req.body;
    try {
        // Only moderators may publish announcements (they notify everyone interested).
        const is_important = wantsAnnouncement && !!(await getUserData(req.userId!)).is_mod;
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
        const visible = withoutHidden(normalpost ?? [], await hiddenPosts(), req.userId);
        res.status(200).json(await withMyReaction(await withOwnership(visible, req.userId), req.userId));
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
        res.status(200).json(await withOwnership(withoutHidden(data ?? [], await hiddenPosts(), req.userId), req.userId));
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
        const hidden = await hiddenPosts();
        const visible = (announcement ?? []).filter((p) => !hidden.has(p.id));
        res.status(200).json(await withMyReaction(await withOwnership(visible, req.userId), req.userId));
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.get("/post/:pid/fetch", optionalAuth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    try {
        const { data: post, error } = await supabase
            .from('v_post_all_data')
            .select("*")
            .eq('id', pid)
            .maybeSingle();
        if (error) throw error;
        if (!post) return res.status(404).json({ message: "Post not found" });

        // A hidden post opens only for its author and for moderators (e.g. from the report queue).
        const h = (await hiddenPosts()).get(pid);
        if (h) {
            const isOwner = !!req.userId && req.userId === h.user_id;
            const isMod = !!req.userId && !isOwner && (await getUserData(req.userId)).is_mod;
            if (!isOwner && !isMod) return res.status(404).json({ message: "Post not found" });
            return res.status(200).json({ ...post, is_hidden: true, hidden_reason: h.hidden_reason, hidden_at: h.hidden_at, is_mine: isOwner });
        }
        const [mine] = await withOwnership([post], req.userId);
        res.status(200).json(mine);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

// RPC this one.
router.post("/post/:pid/react", auth, async (req: Request, res: Response) => {
    const { pid } = req.params;
    const { reaction_type, change } = req.body;
    try {
        if (await isHidden(String(req.params.pid))) return res.status(403).json({ message: HIDDEN_POST_MESSAGE });
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
    const pid = String(req.params.pid);
    const { title, content, is_important, category_names } = req.body;

    try {
        const access = await postAccess(pid, req.userId!);
        if (!access.exists) return res.status(404).json({ message: "Post not found" });
        if (!access.isOwner && !access.isMod) return res.status(403).json({ message: "Only the author or a moderator can edit this post." });

        // Announcements are a moderator decision; an author editing their own post keeps its current setting.
        const isMod = access.isMod || (access.isOwner && !!(await getUserData(req.userId!)).is_mod);
        const changes = isMod ? { title, content, is_important } : { title, content };
        const stamp = { edited_at: new Date(), edited_by: req.userId };

        let { error } = await supabase.from('posts').update({ ...changes, ...stamp }).eq('id', pid);
        // Before api/sql/2026-10-13_post_edits.sql has run there is nowhere to record the edit.
        if (error && isMissingColumn(error)) ({ error } = await supabase.from('posts').update(changes).eq('id', pid));
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

async function notify(rows: { user_id: string; post_id: string; message: string }[]) {
    if (!rows.length) return;
    const { error } = await supabase.from("notifications").insert(rows);
    // The moderation already happened; a failed notification should not undo it.
    if (error) console.error("notify", error);
}

/**
 * Hide a post (moderators). It leaves the feed but keeps its reports, which are closed
 * as Reviewed; the reporters and the author are told.
 */
router.put("/post/:pid/hide", auth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    const reason = String(req.body?.reason ?? "").trim().slice(0, 300) || null;
    try {
        const userData = await getUserData(req.userId!);
        if (!userData.is_mod) return res.status(403).json({ message: "Only mods are allowed to hide posts." });

        const { data: post, error } = await supabase
            .from("posts")
            .update({ is_hidden: true, hidden_at: new Date(), hidden_by: req.userId, hidden_reason: reason })
            .eq("id", pid)
            .select("id, user_id, title")
            .maybeSingle();
        if (error) {
            if (isMissingColumn(error)) {
                return res.status(501).json({ code: error.code, message: "Run api/sql/2026-10-13_hide_posts.sql in Supabase first." });
            }
            throw error;
        }
        if (!post) return res.status(404).json({ message: "Post not found" });

        const { data: closed, error: reportError } = await supabase
            .from("reports")
            .update({ status: "Reviewed", reviewed_by: req.userId, reviewed_at: new Date() })
            .eq("post_id", pid)
            .eq("status", "Open")
            .select("user_id");
        if (reportError) throw reportError;

        const title = post.title || "ไม่มีชื่อ";
        const reporters = [...new Set((closed ?? []).map((r) => r.user_id))].filter((u) => u !== post.user_id);
        await notify([
            ...reporters.map((user_id) => ({
                user_id, post_id: pid,
                message: `ผู้ดูแลซ่อนโพสต์ "${title}" ที่คุณรายงานแล้ว ขอบคุณที่ช่วยดูแลชุมชน`,
            })),
            {
                user_id: post.user_id, post_id: pid,
                message: `โพสต์ "${title}" ของคุณถูกซ่อนโดยผู้ดูแล${reason ? ` · เหตุผล: ${reason}` : ""}`,
            },
        ]);

        res.status(200).json({ id: pid, is_hidden: true, hidden_reason: reason, reports_closed: closed?.length ?? 0 });
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

/** Every hidden post (moderators), including ones hidden without any report. */
router.get("/post/hidden", auth, async (req: Request, res: Response) => {
    try {
        if (!(await getUserData(req.userId!)).is_mod) return res.status(403).json({ message: "Only mods can list hidden posts." });
        const { data, error } = await supabase
            .from("posts")
            .select("id, title, hidden_reason, hidden_at, author:users!posts_user_id_fkey(display_name)")
            .eq("is_hidden", true)
            .order("hidden_at", { ascending: false });
        if (error) {
            if (isMissingColumn(error)) return res.status(200).json([]);
            throw error;
        }
        res.status(200).json(data ?? []);
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

/** Show a hidden post again (moderators). Its reports keep the status they have. */
router.put("/post/:pid/unhide", auth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    try {
        const userData = await getUserData(req.userId!);
        if (!userData.is_mod) return res.status(403).json({ message: "Only mods are allowed to unhide posts." });

        const { data: post, error } = await supabase
            .from("posts")
            .update({ is_hidden: false, hidden_at: null, hidden_by: null, hidden_reason: null })
            .eq("id", pid)
            .select("id, user_id, title")
            .maybeSingle();
        if (error) {
            if (isMissingColumn(error)) {
                return res.status(501).json({ code: error.code, message: "Run api/sql/2026-10-13_hide_posts.sql in Supabase first." });
            }
            throw error;
        }
        if (!post) return res.status(404).json({ message: "Post not found" });

        await notify([{ user_id: post.user_id, post_id: pid, message: `โพสต์ "${post.title || "ไม่มีชื่อ"}" ของคุณกลับมาแสดงแล้ว` }]);
        res.status(200).json({ id: pid, is_hidden: false });
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

/**
 * Delete a post: its author, or a moderator. (For moderation, hiding is usually better:
 * it keeps the reports. See /post/:pid/hide.)
 */
router.delete("/post/:pid/delete", auth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    try {
        const access = await postAccess(pid, req.userId!);
        if (!access.exists) return res.status(404).json({ message: "Post not found" });
        if (!access.isOwner && !access.isMod) return res.status(403).json({ message: "Only the author or a moderator can delete this post." });

        // Note the uploaded files first: the media rows go with the post.
        const { data: media } = await supabase.from("media").select("file_url").eq("post_id", pid);
        const files = (media ?? [])
            .map((m) => decodeURIComponent(String(m.file_url).split("/object/public/post_medias/")[1] ?? ""))
            .filter(Boolean);

        const removePost = () => supabase.from("posts").delete().eq("id", pid).select("id");
        let { error } = await removePost();

        // 23503 = rows elsewhere still point at the post and their foreign keys don't cascade:
        // remove those first, then the post.
        if (error?.code === "23503") {
            const { data: comments, error: cErr } = await supabase.from("comments").select("id").eq("post_id", pid);
            if (cErr) throw cErr;
            const commentIds = (comments ?? []).map((c) => c.id);
            if (commentIds.length) {
                const r = await supabase.from("comment_reactions").delete().in("comment_id", commentIds);
                if (r.error) throw r.error;
            }
            for (const table of ["comments", "post_reactions", "post_categories", "media", "reports", "notifications"]) {
                const r = await supabase.from(table).delete().eq("post_id", pid);
                if (r.error) throw r.error;
            }
            ({ error } = await removePost());
        }
        if (error) throw error;

        // The post is gone; leftover files would only waste storage, so a failure here is logged, not returned.
        if (files.length) {
            const { error: storageError } = await supabase.storage.from("post_medias").remove(files);
            if (storageError) console.error("delete post media", pid, storageError.message);
        }
        res.status(200).json({ id: pid, deleted: true, files_removed: files.length });
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

export default router;
