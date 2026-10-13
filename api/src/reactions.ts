import supabase from "./db";

/**
 * Reaction lookups for the fetch routes. Writes go through the react_to_post / react_to_comment
 * RPCs (see the /react routes), which flip the viewer's reaction and return the new total.
 */
type Target =
    | { table: "post_reactions"; fk: "post_id" }
    | { table: "comment_reactions"; fk: "comment_id" };

export const POST_TARGET: Target = { table: "post_reactions", fk: "post_id" };
export const COMMENT_TARGET: Target = { table: "comment_reactions", fk: "comment_id" };

/** Map of targetId -> this user's reaction, for the ids currently on screen. */
export async function myReactions(
    { table, fk }: Target,
    targetIds: string[],
    userId: string,
): Promise<Record<string, string>> {
    if (targetIds.length === 0) return {};
    const { data, error } = await supabase
        .from(table)
        .select(`${fk}, reaction_type`)
        .eq("user_id", userId)
        .in(fk, targetIds);
    if (error) throw error;
    const out: Record<string, string> = {};
    for (const row of (data ?? []) as any[]) out[row[fk]] = row.reaction_type;
    return out;
}

/**
 * Map of targetId -> total reactions.
 *
 * v_post_all_data already aggregates this for posts, but v_comments does not
 * expose a reaction_count at all, so comment threads have to count here.
 */
export async function reactionCounts(
    { table, fk }: Target,
    targetIds: string[],
): Promise<Record<string, number>> {
    if (targetIds.length === 0) return {};
    const { data, error } = await supabase
        .from(table)
        .select(fk)
        .in(fk, targetIds);
    if (error) throw error;
    const out: Record<string, number> = {};
    for (const id of targetIds) out[id] = 0;
    for (const row of (data ?? []) as any[]) out[row[fk]] = (out[row[fk]] ?? 0) + 1;
    return out;
}
