import { Request, Response, NextFunction } from "express";
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

// What each successful write changes. First match wins.
const LIVE_TOPICS: [RegExp, LiveTopic[]][] = [
    [/^\/post\/create/, ["posts", "notifications"]],          // announcements notify followers
    [/^\/post\/[^/]+\/react/, ["posts"]],
    [/^\/post\//, ["posts", "reports", "notifications"]],     // edit, hide, unhide, delete
    [/^\/comment\//, ["comments", "notifications"]],         // new comments notify the post's author
    [/^\/report\//, ["reports", "notifications"]],           // closing a report notifies the reporters
    [/^\/admin\/categories/, ["categories", "posts"]],       // a renamed category shows on posts
    [/^\/admin\/users/, ["roles"]],                          // the user whose role changed updates at once
    [/^\/user\/me$/, ["posts", "comments", "roles"]],        // a new display name shows on posts and comments
];

/** After every successful write, broadcast the topics it touched. */
export function liveUpdates(req: Request, res: Response, next: NextFunction) {
    if (req.method !== "GET") {
        res.on("finish", () => {
            if (res.statusCode >= 300) return;
            const topics = LIVE_TOPICS.find(([re]) => re.test(req.path))?.[1];
            // POST /comment/<post id> and /comment/<post id>/replyto/<comment id> name the post.
            // (PUT/DELETE /comment/<id> carry a comment id, so those reload every thread.)
            const postId = req.method === "POST" ? /^\/comment\/([0-9a-f-]{36})(\/replyto\/|$)/i.exec(req.path)?.[1] : undefined;
            if (topics) broadcast(topics, postId);
        });
    }
    next();
}
