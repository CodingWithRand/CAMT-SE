import supabase from "./db";
import { MESSAGES, untitled } from "./notify";

/**
 * Tell everyone who follows one of the post's categories that it was posted (or, for an
 * announcement, published): one notification per person, naming the first followed category.
 * The author is skipped, and nobody gets the same kind of notification for a post twice
 * (so a post edited into an announcement notifies once, and the old database trigger,
 * if it still runs, does not double up).
 */
export async function notifyFollowers(post: { id: string; user_id: string; title: string | null; is_important: boolean }, categoryIds: string[], authorName: string) {
    if (!categoryIds.length) return;
    const [{ data: follows, error }, { data: cats, error: catError }] = await Promise.all([
        supabase.from("user_interests").select("user_id, category_id").in("category_id", categoryIds).neq("user_id", post.user_id),
        supabase.from("categories").select("id, category_name").in("id", categoryIds),
    ]);
    if (error || catError) return console.error("notify followers", (error ?? catError)?.message);

    const catName = new Map((cats ?? []).map((c) => [c.id, c.category_name as string]));
    const firstCategory = new Map<string, string>();
    for (const f of follows ?? []) if (!firstCategory.has(f.user_id)) firstCategory.set(f.user_id, catName.get(f.category_id) ?? "");
    if (!firstCategory.size) return;

    // Skip people who already have this kind of notification for the post.
    const prefix = post.is_important ? "ประกาศใหม่" : `${authorName} โพสต์ใหม่ในหมวด`;
    const { data: already } = await supabase.from("notifications").select("user_id")
        .eq("post_id", post.id).in("user_id", [...firstCategory.keys()]).like("message", `${prefix}%`);
    const skip = new Set((already ?? []).map((n) => n.user_id));

    const title = untitled(post.title);
    const rows = [...firstCategory].filter(([uid]) => !skip.has(uid)).map(([user_id, category]) => ({
        user_id, post_id: post.id, is_read: false,
        message: post.is_important ? MESSAGES.announcementInFollowed(category, title) : MESSAGES.postInFollowed(authorName, category, title),
    }));
    if (!rows.length) return;
    const { error: insertError } = await supabase.from("notifications").insert(rows);
    if (insertError) console.error("notify followers", insertError.message);
}
