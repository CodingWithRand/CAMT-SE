import supabase from "./db";

/**
 * Tell open browsers that something changed, so they re-fetch instead of waiting for a reload.
 *
 * Only a hint goes out ("reports changed"), never the data: each browser then reloads through
 * the API with its own permissions. A public broadcast channel needs no table replication and
 * keeps working once RLS is turned on for the tables.
 */
export type LiveTopic = "posts" | "comments" | "reports" | "notifications" | "categories" | "roles";

export const LIVE_CHANNEL = "wnm-live";
export const LIVE_EVENT = "changed";

const channel = supabase.channel(LIVE_CHANNEL);

/** `postId` narrows a comments hint to one post, so browsers reload just that thread. */
export function broadcast(topics: LiveTopic[], postId?: string) {
    // Fire and forget: a missed hint only means the browser picks it up on its next poll.
    channel.httpSend(LIVE_EVENT, { topics, post_id: postId, at: Date.now() }).catch((err) => console.error("broadcast", err?.message ?? err));
}
