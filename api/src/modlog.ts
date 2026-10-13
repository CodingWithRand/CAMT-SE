import supabase from "./db";

export type ModAction =
    | "report_reviewed" | "report_dismissed" | "report_reopened"
    | "post_hidden" | "post_unhidden" | "post_edited" | "post_deleted" | "comment_deleted"
    | "category_created" | "category_updated" | "category_deleted"
    | "role_granted" | "role_revoked";

/** The table comes from api/sql/2026-10-13_moderation_log.sql; until that has run, PostgREST reports it missing. */
export const isMissingTable = (error: { code?: string } | null | undefined) =>
    error?.code === "PGRST205" || error?.code === "42P01";

/**
 * Record a moderator action. The action already happened, so a failed write is logged and
 * swallowed (and stays quiet while the table has not been created yet).
 */
export async function logAction(actorId: string, action: ModAction, about: {
    post_id?: string; post_title?: string | null; target_id?: string; detail?: string | null;
} = {}) {
    const { error } = await supabase.from("moderation_log").insert({ actor_id: actorId, action, ...about });
    if (error && !isMissingTable(error)) console.error("moderation log", action, error.message);
}
