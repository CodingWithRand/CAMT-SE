import crypto from "crypto";
import path from "path";
import supabase from "./db";
import { hiddenPosts, withoutHidden } from "./hidden";
import { isModerator, UUID } from "./middleware";
import { POST_TARGET, myReactions } from "./reactions";

/** Most rows one feed or search request returns. */
export const PAGE_MAX = 100;

/**
 * Add what v_post_all_data lacks: whether the viewer wrote the post (so the page offers
 * edit and delete), and whether it was edited and by whom (for the "edited" label).
 */
export async function withOwnership<T extends { id: string }>(rows: T[], viewerId?: string) {
    if (!rows.length) return rows.map((r) => ({ ...r, is_mine: false }));
    const { data, error } = await supabase.from("posts").select("id, user_id, edited_at, edited_by").in("id", rows.map((r) => r.id));
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

/**
 * v_post_all_data carries the total reaction_count but nothing about who reacted, so a
 * signed-in reader's own reaction is stitched on here. It cannot live in the view: the API
 * connects with the service_role key, so auth.uid() inside a view is always NULL.
 */
async function withMyReaction<T extends { id: string }>(posts: T[], userId?: string) {
    if (!userId || !posts.length) return posts.map((p) => ({ ...p, my_reaction: null as string | null }));
    const mine = await myReactions(POST_TARGET, posts.map((p) => p.id), userId);
    return posts.map((p) => ({ ...p, my_reaction: mine[p.id] ?? null }));
}

/** Everything the page needs on top of the view's row: ownership, edit label, the viewer's reaction. */
export const decorate = async <T extends { id: string }>(rows: T[], viewerId?: string) =>
    withMyReaction(await withOwnership(rows, viewerId), viewerId);

/** View rows as one viewer may see them: hidden posts dropped (except their own, flagged), then decorated. */
export async function forViewer<T extends { id: string }>(rows: T[], viewerId?: string) {
    return decorate(withoutHidden(rows, await hiddenPosts(), viewerId), viewerId);
}

/** Who may change a post: its author, or any moderator. */
export async function postAccess(pid: string, userId: string) {
    const { data: post, error } = await supabase.from("posts").select("id, user_id, title, is_important").eq("id", pid).maybeSingle();
    if (error) throw error;
    if (!post) return { exists: false, isOwner: false, isMod: false, title: null, author: null, wasImportant: false };
    return {
        exists: true, isOwner: post.user_id === userId, isMod: await isModerator(userId),
        title: post.title as string | null, author: post.user_id as string, wasImportant: !!post.is_important,
    };
}

/**
 * Feed filters: ?categories=<id>,<id> (posts in any of them) and ?following=1 (posts in the
 * viewer's followed categories); both together means both must hold. null = no filter.
 */
export async function filteredPostIds(query: { categories?: unknown; following?: unknown }, viewerId?: string): Promise<string[] | null | "unauthorized"> {
    const lists: string[][] = [];
    const inCategories = async (ids: string[]) => {
        const { data, error } = await supabase.from("post_categories").select("post_id").in("category_id", ids);
        if (error) throw error;
        return [...new Set((data ?? []).map((r) => r.post_id as string))];
    };
    const wanted = String(query.categories ?? "").split(",").map((x) => x.trim()).filter((x) => UUID.test(x));
    if (wanted.length) lists.push(await inCategories(wanted));
    if (query.following === "1") {
        if (!viewerId) return "unauthorized";
        const { data, error } = await supabase.from("user_interests").select("category_id").eq("user_id", viewerId);
        if (error) throw error;
        const followed = (data ?? []).map((r) => r.category_id as string);
        lists.push(followed.length ? await inCategories(followed) : []);
    }
    if (!lists.length) return null;
    return lists.reduce((a, b) => a.filter((id) => b.includes(id)));
}

/** Upload one file to storage (post_medias/<post>/<kind>s/<md5>.<ext>) and return its media row. */
export async function uploadPostMedia(pid: string, m: Express.Multer.File, mt: "image" | "video") {
    const filehash = crypto.createHash("md5").update(m.buffer).digest("hex");
    const fileName = `${pid}/${mt}s/${filehash}${path.extname(m.originalname).toLowerCase()}`;
    const { data, error } = await supabase.storage.from("post_medias").upload(fileName, m.buffer, { contentType: m.mimetype, upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("post_medias").getPublicUrl(data.path);
    return { post_id: pid, file_url: publicUrl, media_type: mt };
}

/**
 * Delete a post with everything that points at it, then its uploaded files. Returns how many
 * files were removed. Storage failures are logged only: the post is already gone.
 */
export async function deletePostCascade(pid: string) {
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

    if (files.length) {
        const { error: storageError } = await supabase.storage.from("post_medias").remove(files);
        if (storageError) console.error("delete post media", pid, storageError.message);
    }
    return files.length;
}
