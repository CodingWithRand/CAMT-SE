import supabase from "./db";

// Mirrors the Postgres enum public.reaction_type.
export const REACTION_TYPES = ["like", "love", "haha", "sad", "angry", "care"] as const;
export type ReactionType = typeof REACTION_TYPES[number];

export function isReactionType(v: any): v is ReactionType {
    return REACTION_TYPES.includes(v);
}

type Target =
    | { table: "post_reactions"; fk: "post_id" }
    | { table: "comment_reactions"; fk: "comment_id" };

export const POST_TARGET: Target = { table: "post_reactions", fk: "post_id" };
export const COMMENT_TARGET: Target = { table: "comment_reactions", fk: "comment_id" };

export interface ReactionResult {
    reaction_count: number;
    my_reaction: ReactionType | null;
}

async function countFor({ table, fk }: Target, targetId: string) {
    const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq(fk, targetId);
    if (error) throw error;
    return count ?? 0;
}

/**
 * Set this user's reaction on one post/comment and report the new totals.
 *
 * Both reaction tables carry a unique (target, user) constraint, so a user holds
 * at most one reaction and `upsert` can switch it in a single statement — no
 * read-then-write race. Sending the reaction already held, or null, clears it,
 * which is what the UI's toggle does.
 *
 * We write the rows directly instead of calling the react_to_post / react_to_comment
 * RPCs: those are broken (42804 — they pass `rtype` as text into the enum column
 * without a cast) and fixing them needs DDL access to the Supabase project.
 */
export async function setReaction(
    target: Target,
    targetId: string,
    userId: string,
    rtype: ReactionType | null,
): Promise<ReactionResult> {
    const { table, fk } = target;

    const { data: existing, error: readErr } = await supabase
        .from(table)
        .select("reaction_type")
        .eq(fk, targetId)
        .eq("user_id", userId)
        .maybeSingle();
    if (readErr) throw readErr;

    const current: ReactionType | null = existing?.reaction_type ?? null;
    const clearing = rtype === null || rtype === current;

    if (clearing) {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq(fk, targetId)
            .eq("user_id", userId);
        if (error) throw error;
        return { reaction_count: await countFor(target, targetId), my_reaction: null };
    }

    const { error } = await supabase
        .from(table)
        .upsert(
            { [fk]: targetId, user_id: userId, reaction_type: rtype },
            { onConflict: `${fk},user_id` },
        );
    if (error) throw error;
    return { reaction_count: await countFor(target, targetId), my_reaction: rtype };
}

/** Map of targetId -> this user's reaction, for the ids currently on screen. */
export async function myReactions(
    { table, fk }: Target,
    targetIds: string[],
    userId: string,
): Promise<Record<string, ReactionType>> {
    if (targetIds.length === 0) return {};
    const { data, error } = await supabase
        .from(table)
        .select(`${fk}, reaction_type`)
        .eq("user_id", userId)
        .in(fk, targetIds);
    if (error) throw error;
    const out: Record<string, ReactionType> = {};
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
