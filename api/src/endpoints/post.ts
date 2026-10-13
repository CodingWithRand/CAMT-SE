import { Request, Response, Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { Post } from "../model";
import supabase from "../db";
import path from "path";
import { auth, isModerator, optionalAuth, requireMod, uuidParam, UUID } from "../middleware";
import { HIDDEN_POST_MESSAGE, hiddenPosts, isHidden, withoutHidden } from "../hidden";
import { POST_TARGET, myReactions } from "../reactions";
import { MESSAGES, notify, untitled } from "../notify";

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
    const { data, error } = await supabase.from("posts").select("id, user_id, edited_at, edited_by").in("id", ids);
    if (error) throw error;
    const meta = new Map((data ?? []).map((p) => [p.id, p]));
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
    return { exists: true, isOwner: post.user_id === userId, isMod: await isModerator(userId) };
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

    // Only moderators may publish announcements (they notify everyone interested).
    const is_important = wantsAnnouncement && await isModerator(req.userId);
    // INSERT INTO posts VALUES(id, user_id, title, content, is_important);
    const { data, error } = await supabase
        .from('posts')
        .insert({ user_id: req.userId, title, content, is_important })
        .select()
        .single();
    
    if (error) throw error;

    // INSERT INTO post_categories VALUES(pid, cid);
    const { error: cderr } = await supabase
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
})

/**
 * v_post_all_data carries the total reaction_count but nothing about who
 * reacted, so a signed-in reader's own reaction is stitched on here in one
 * extra query. Logged-out readers just get my_reaction: null.
 *
 * It cannot live in the view: the API connects with the service_role key, so
 * auth.uid() inside a view is always NULL and only this layer knows the caller.
 */
/** Everything the page needs on top of the view's row: ownership, edit label, the viewer's reaction. */
const decorate = async <T extends { id: string }>(rows: T[], viewerId?: string) =>
    withMyReaction(await withOwnership(rows, viewerId), viewerId);

async function withMyReaction(posts: any[], userId?: string) {
    if (!userId || !posts?.length) {
        return (posts ?? []).map((p) => ({ ...p, my_reaction: null }));
    }
    const mine = await myReactions(POST_TARGET, posts.map((p) => p.id), userId);
    return posts.map((p) => ({ ...p, my_reaction: mine[p.id] ?? null }));
}

const PAGE_MAX = 100;

/**
 * The feed, newest first. Without `limit` every post comes back as an array (older callers).
 * With `limit` (and `before`, the `next_before` of the previous page) it answers
 * { posts, next_before } — next_before is null on the last page. Hidden posts are dropped
 * after the page is cut, so a page can be shorter than `limit` and still not be the last.
 * The cursor is "<created_at>|<id>": posts can share a timestamp, so the id breaks ties.
 */
router.get("/post/fetch", optionalAuth, async (req: Request, res: Response) => {
    const limit = Number(req.query.limit);
    const paged = Number.isInteger(limit) && limit > 0;
    let query = supabase.from("v_post_all_data").select("*")
        .order("created_at", { ascending: false }).order("id", { ascending: false });
    if (paged) {
        query = query.limit(Math.min(limit, PAGE_MAX) + 1);
        const [at, id] = String(req.query.before ?? "").split("|");
        if (at && UUID.test(id ?? "") && !Number.isNaN(Date.parse(at))) {
            query = query.or(`created_at.lt."${at}",and(created_at.eq."${at}",id.lt.${id})`);
        }
    }
    const { data, error } = await query;
    if (error) throw error;

    const rows = data ?? [];
    const more = paged && rows.length > Math.min(limit, PAGE_MAX);
    const page = more ? rows.slice(0, -1) : rows;
    const posts = await decorate(withoutHidden(page, await hiddenPosts(), req.userId), req.userId);
    if (!paged) return res.status(200).json(posts);
    const last = page[page.length - 1];
    res.status(200).json({ posts, next_before: more ? `${last.created_at}|${last.id}` : null });
})

/** Search title, text and author name across every post (not just the ones the page has loaded). */
router.get("/post/search", optionalAuth, async (req: Request, res: Response) => {
    // PostgREST's or() filter treats , ( ) as syntax and % * as wildcards; drop them from the term.
    const q = String(req.query.q ?? "").replace(/[,()%*\\]/g, " ").trim().slice(0, 60);
    if (!q) return res.status(200).json([]);
    const { data, error } = await supabase
        .from("v_post_all_data")
        .select("*")
        .or(`title.ilike.%${q}%,content.ilike.%${q}%,author_name.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(PAGE_MAX);
    if (error) throw error;
    res.status(200).json(await decorate(withoutHidden(data ?? [], await hiddenPosts(), req.userId), req.userId));
})

/** The signed-in user's own posts, hidden ones included (flagged), for the profile page. */
router.get("/post/mine", auth, async (req: Request, res: Response) => {
    const { data: own, error } = await supabase.from("posts").select("id").eq("user_id", req.userId!);
    if (error) throw error;
    const ids = (own ?? []).map((p) => p.id);
    if (!ids.length) return res.status(200).json([]);
    const { data, error: e2 } = await supabase.from("v_post_all_data").select("*").in("id", ids).order("created_at", { ascending: false });
    if (e2) throw e2;
    res.status(200).json(await decorate(withoutHidden(data ?? [], await hiddenPosts(), req.userId), req.userId));
})

router.get("/post/fetch/categories", auth, async (req: Request, res: Response) => {
    const { category_id } = req.body; // array of category_ids

    const { data, error } = await supabase.rpc('get_post_from_cate', {
        cate_id: category_id
    })
    if (error) throw error;
    res.status(200).json(await withOwnership(withoutHidden(data ?? [], await hiddenPosts(), req.userId), req.userId));
})

router.get("/post/fetch/announcement", optionalAuth, async (req: Request, res: Response) => {
    const { data: announcement, error: error1 } = await supabase
        .from('v_post_all_data')
        .select("*")
        .eq('is_important', true)
        .order('created_at', { ascending: false })
        .limit(5);
    if (error1) throw error1;
    const hidden = await hiddenPosts();
    const visible = (announcement ?? []).filter((p) => !hidden.has(p.id));
    res.status(200).json(await decorate(visible, req.userId));
})

router.get("/post/:pid/fetch", optionalAuth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
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
        const isMod = !isOwner && await isModerator(req.userId);
        if (!isOwner && !isMod) return res.status(404).json({ message: "Post not found" });
        return res.status(200).json({ ...post, is_hidden: true, hidden_reason: h.hidden_reason, hidden_at: h.hidden_at, is_mine: isOwner });
    }
    const [mine] = await withOwnership([post], req.userId);
    res.status(200).json(mine);
})

router.post("/post/:pid/react", auth, async (req: Request, res: Response) => {
    const { pid } = req.params;
    const { reaction_type, change } = req.body;
    if (await isHidden(String(req.params.pid))) return res.status(403).json({ message: HIDDEN_POST_MESSAGE });
    const { data, error } = await supabase.rpc("react_to_post", {
        pid,
        uid: req.userId,
        rtype: reaction_type,
        change_reaction: change || false
    })
    if(error) throw error;
    res.status(200).json(data); // reaction count send to the frontend.
})

router.put("/post/:pid/edit", auth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    const { title, content, is_important, category_names } = req.body;

    const access = await postAccess(pid, req.userId!);
    if (!access.exists) return res.status(404).json({ message: "Post not found" });
    if (!access.isOwner && !access.isMod) return res.status(403).json({ message: "Only the author or a moderator can edit this post." });

    // Announcements are a moderator decision; an author editing their own post keeps its current setting.
    const changes = access.isMod ? { title, content, is_important } : { title, content };
    const { error } = await supabase.from('posts').update({ ...changes, edited_at: new Date(), edited_by: req.userId }).eq('id', pid);
    if (error) throw error;
    // Replaces the post's categories with the named ones.
    const { error: cderr } = await supabase
        .rpc('update_post_cate', {
            pid,
            cate_name: category_names
        })
    
    if (cderr) throw cderr;
    res.status(200).send();
})

/**
 * Hide a post (moderators). It leaves the feed but keeps its reports, which are closed
 * as Reviewed; the reporters and the author are told.
 */
router.put("/post/:pid/hide", auth, requireMod, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    const reason = String(req.body?.reason ?? "").trim().slice(0, 300) || null;

    const { data: post, error } = await supabase
        .from("posts")
        .update({ is_hidden: true, hidden_at: new Date(), hidden_by: req.userId, hidden_reason: reason })
        .eq("id", pid)
        .select("id, user_id, title")
        .maybeSingle();
    if (error) throw error;
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { data: closed, error: reportError } = await supabase
        .from("reports")
        .update({ status: "Reviewed", reviewed_by: req.userId, reviewed_at: new Date() })
        .eq("post_id", pid)
        .eq("status", "Open")
        .select("user_id");
    if (reportError) throw reportError;

    const title = untitled(post.title);
    const reporters = [...new Set((closed ?? []).map((r) => r.user_id))].filter((u) => u !== post.user_id);
    await notify([
        ...reporters.map((user_id) => ({
            user_id, post_id: pid,
            message: MESSAGES.reportedPostHidden(title),
        })),
        {
            user_id: post.user_id, post_id: pid,
            message: MESSAGES.yourPostHidden(title, reason),
        },
    ]);

    res.status(200).json({ id: pid, is_hidden: true, hidden_reason: reason, reports_closed: closed?.length ?? 0 });
})

/** Every hidden post (moderators), including ones hidden without any report. */
router.get("/post/hidden", auth, requireMod, async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from("posts")
        .select("id, title, hidden_reason, hidden_at, author:users!posts_user_id_fkey(display_name)")
        .eq("is_hidden", true)
        .order("hidden_at", { ascending: false });
    if (error) throw error;
    res.status(200).json(data ?? []);
})

/** Show a hidden post again (moderators). Its reports keep the status they have. */
router.put("/post/:pid/unhide", auth, requireMod, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);

    const { data: post, error } = await supabase
        .from("posts")
        .update({ is_hidden: false, hidden_at: null, hidden_by: null, hidden_reason: null })
        .eq("id", pid)
        .select("id, user_id, title")
        .maybeSingle();
    if (error) throw error;
    if (!post) return res.status(404).json({ message: "Post not found" });

    await notify([{ user_id: post.user_id, post_id: pid, message: MESSAGES.yourPostRestored(untitled(post.title)) }]);
    res.status(200).json({ id: pid, is_hidden: false });
})

/**
 * Delete a post: its author, or a moderator. (For moderation, hiding is usually better:
 * it keeps the reports. See /post/:pid/hide.)
 */
router.delete("/post/:pid/delete", auth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
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
})

export default router;
