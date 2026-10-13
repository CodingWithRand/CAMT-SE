import supabase from "./db";

/**
 * Hiding a post instead of deleting it keeps its reports and notifications,
 * so moderators can still close reports and tell reporters what happened.
 * Columns come from api/sql/2026-10-13_hide_posts.sql.
 */
export interface HiddenInfo {
    user_id: string;
    hidden_reason: string | null;
    hidden_at: string | null;
}

/** Hidden posts by id. */
export async function hiddenPosts(): Promise<Map<string, HiddenInfo>> {
    const { data, error } = await supabase
        .from("posts")
        .select("id, user_id, hidden_reason, hidden_at")
        .eq("is_hidden", true);
    if (error) throw error;
    return new Map((data ?? []).map((p) => [p.id, { user_id: p.user_id, hidden_reason: p.hidden_reason, hidden_at: p.hidden_at }]));
}

/**
 * Drop hidden posts from a list, except the viewer's own: those stay, flagged,
 * so the author can see that and why their post was hidden.
 */
export function withoutHidden<T extends { id: string }>(rows: T[], hidden: Map<string, HiddenInfo>, viewerId?: string) {
    return rows.flatMap((row) => {
        const h = hidden.get(row.id);
        if (!h) return [row];
        if (viewerId && h.user_id === viewerId) return [{ ...row, is_hidden: true, hidden_reason: h.hidden_reason, hidden_at: h.hidden_at }];
        return [];
    });
}

/** Whether a post is hidden. Hidden posts take no new comments or reactions. */
export async function isHidden(postId: string) {
    const { data, error } = await supabase.from("posts").select("is_hidden").eq("id", postId).maybeSingle();
    if (error) throw error;
    return !!data?.is_hidden;
}

export const HIDDEN_POST_MESSAGE = "This post is hidden; it takes no new comments or reactions.";
