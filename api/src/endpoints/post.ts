import { Request, Response, Router } from "express";
import multer from "multer";
import supabase from "../db";
import { notifyFollowers } from "../followers";
import { HIDDEN_POST_MESSAGE, isHidden } from "../hidden";
import { auth, isModerator, uuidParam } from "../middleware";
import { logAction } from "../modlog";
import { deletePostCascade, postAccess, uploadPostMedia } from "../posts";
import { limits } from "../rateLimit";
import { getUserData } from "../users";
import { LIMITS, text } from "../validate";

/** Writing posts: create, edit, delete, react. (Reads are in feed.ts, hiding in moderation.ts.) */
const router = Router();
router.param("pid", uuidParam);
const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: multer.memoryStorage(),
})

const displayName = async (userId: string) => (await getUserData(userId)).display_name ?? "มีคน";

/**
 * Create a post (multipart/form-data: title, content, category_id (one or more),
 * is_important, images[] up to 10, videos[] up to 1). Followers of its categories are told.
 */
router.post("/post/create",
    auth,
    limits.post,
    upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 1 }]),
    async (req: Request, res: Response) => {
    const title = text(req.body.title, "title", LIMITS.title);
    const content = text(req.body.content, "content", LIMITS.post);
    if ("error" in title) return res.status(400).json({ message: title.error });
    if ("error" in content) return res.status(400).json({ message: content.error });

    // multipart/form-data sends everything as text: a lone category_id arrives as
    // a string instead of an array, and is_important as "true" / "false".
    const category_id: string[] = [req.body.category_id ?? []].flat();
    const wantsAnnouncement = req.body.is_important === true || req.body.is_important === "true";

    const files = (req.files ?? {}) as { [field: string]: Express.Multer.File[] };
    const images = files["images"] ?? [];
    const videos = files["videos"] ?? [];

    // Checked before anything is written, so a bad request leaves no half-made post behind.
    if (category_id.length === 0) return res.status(400).json({ message: "At least one category is required." });
    if (images.some((img) => !img.mimetype.startsWith("image/"))) return res.status(400).json({ message: "images must be image files." });
    if (videos.some((vid) => !vid.mimetype.startsWith("video/"))) return res.status(400).json({ message: "videos must be video files." });

    // Only moderators may publish announcements.
    const is_important = wantsAnnouncement && await isModerator(req.userId);
    const { data, error } = await supabase
        .from("posts")
        .insert({ user_id: req.userId, title: title.value, content: content.value, is_important })
        .select()
        .single();
    if (error) throw error;

    const { error: cderr } = await supabase
        .from("post_categories")
        .insert(category_id.map((cid) => ({ post_id: data.id, category_id: cid })));
    if (cderr) throw cderr;

    if (images.length || videos.length) {
        const uploaded = await Promise.all([
            ...images.map((img) => uploadPostMedia(data.id, img, "image")),
            ...videos.map((vid) => uploadPostMedia(data.id, vid, "video")),
        ]);
        const { error: mderr } = await supabase.from("media").insert(uploaded);
        if (mderr) throw mderr;
    }

    await notifyFollowers(data, category_id, await displayName(req.userId!));
    res.status(200).json(data);
})

/** Toggle the viewer's reaction (the react_to_post RPC); answers with the new total. */
router.post("/post/:pid/react", auth, limits.react, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    const { reaction_type, change } = req.body;
    if (await isHidden(pid)) return res.status(403).json({ message: HIDDEN_POST_MESSAGE });
    const { data, error } = await supabase.rpc("react_to_post", {
        pid,
        uid: req.userId,
        rtype: reaction_type,
        change_reaction: change || false,
    })
    if (error) throw error;
    res.status(200).json(data);
})

/** Edit a post: its author, or a moderator (who alone may switch it to or from an announcement). */
router.put("/post/:pid/edit", auth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    const { is_important, category_names } = req.body;
    const title = text(req.body?.title, "title", LIMITS.title);
    const content = text(req.body?.content, "content", LIMITS.post);
    if ("error" in title) return res.status(400).json({ message: title.error });
    if ("error" in content) return res.status(400).json({ message: content.error });
    if (!Array.isArray(category_names) || !category_names.length || category_names.some((n) => typeof n !== "string")) {
        return res.status(400).json({ message: "category_names must be a non-empty list of category names" });
    }

    const access = await postAccess(pid, req.userId!);
    if (!access.exists) return res.status(404).json({ message: "Post not found" });
    if (!access.isOwner && !access.isMod) return res.status(403).json({ message: "Only the author or a moderator can edit this post." });

    // An author who is not a moderator keeps the post's current announcement setting.
    const changes = access.isMod
        ? { title: title.value, content: content.value, is_important: !!is_important }
        : { title: title.value, content: content.value };
    const { error } = await supabase.from("posts").update({ ...changes, edited_at: new Date(), edited_by: req.userId }).eq("id", pid);
    if (error) throw error;
    // Replaces the post's categories with the named ones.
    const { error: cderr } = await supabase.rpc("update_post_cate", { pid, cate_name: category_names });
    if (cderr) throw cderr;
    if (!access.isOwner) await logAction(req.userId!, "post_edited", { post_id: pid, post_title: title.value });

    // Turned into an announcement now: its followers have not been told it is one.
    if (access.isMod && !!is_important && !access.wasImportant) {
        const { data: pc, error: pcError } = await supabase.from("post_categories").select("category_id").eq("post_id", pid);
        if (pcError) throw pcError;
        await notifyFollowers({ id: pid, user_id: access.author!, title: title.value, is_important: true },
            (pc ?? []).map((r) => r.category_id), await displayName(access.author!));
    }
    res.status(200).send();
})

/**
 * Delete a post: its author, or a moderator. (For moderation, hiding is usually better:
 * it keeps the reports. See moderation.ts.)
 */
router.delete("/post/:pid/delete", auth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    const access = await postAccess(pid, req.userId!);
    if (!access.exists) return res.status(404).json({ message: "Post not found" });
    if (!access.isOwner && !access.isMod) return res.status(403).json({ message: "Only the author or a moderator can delete this post." });

    const filesRemoved = await deletePostCascade(pid);
    if (!access.isOwner) await logAction(req.userId!, "post_deleted", { post_id: pid, post_title: access.title });
    res.status(200).json({ id: pid, deleted: true, files_removed: filesRemoved });
})

export default router;
