import { Request, Response, Router } from "express";
import supabase from "../db";
import { hiddenPosts } from "../hidden";
import { auth, isModerator, optionalAuth, uuidParam, UUID } from "../middleware";
import { PAGE_MAX, decorate, filteredPostIds, forViewer, withOwnership } from "../posts";

/** Reading posts: the feed, search, announcements, one post, and the viewer's own. */
const router = Router();
router.param("pid", uuidParam);

/**
 * The feed, newest first. Without `limit` every post comes back as an array (older callers).
 * With `limit` (and `before`, the `next_before` of the previous page) it answers
 * { posts, next_before } — next_before is null on the last page. Hidden posts are dropped
 * after the page is cut, so a page can be shorter than `limit` and still not be the last.
 * The cursor is "<created_at>|<id>": posts can share a timestamp, so the id breaks ties.
 * Filters: ?categories=, ?following=1, ?important=1 (see filteredPostIds).
 */
router.get("/post/fetch", optionalAuth, async (req: Request, res: Response) => {
    const limit = Number(req.query.limit);
    const paged = Number.isInteger(limit) && limit > 0;
    const only = await filteredPostIds(req.query, req.userId);
    if (only === "unauthorized") return res.status(401).json({ message: "Sign in to see posts from followed categories" });
    if (only && !only.length) return res.status(200).json(paged ? { posts: [], next_before: null } : []);

    let query = supabase.from("v_post_all_data").select("*")
        .order("created_at", { ascending: false }).order("id", { ascending: false });
    if (only) query = query.in("id", only);
    if (req.query.important === "1") query = query.eq("is_important", true);
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
    const posts = await forViewer(page, req.userId);
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
    res.status(200).json(await forViewer(data ?? [], req.userId));
})

/** The signed-in user's own posts, hidden ones included (flagged), for the profile page. */
router.get("/post/mine", auth, async (req: Request, res: Response) => {
    const { data: own, error } = await supabase.from("posts").select("id").eq("user_id", req.userId!);
    if (error) throw error;
    const ids = (own ?? []).map((p) => p.id);
    if (!ids.length) return res.status(200).json([]);
    const { data, error: e2 } = await supabase.from("v_post_all_data").select("*").in("id", ids).order("created_at", { ascending: false });
    if (e2) throw e2;
    res.status(200).json(await forViewer(data ?? [], req.userId));
})

/** The five newest announcements, for the side rail (never hidden ones, even the viewer's own). */
router.get("/post/fetch/announcement", optionalAuth, async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from("v_post_all_data")
        .select("*")
        .eq("is_important", true)
        .order("created_at", { ascending: false })
        .limit(5);
    if (error) throw error;
    const hidden = await hiddenPosts();
    res.status(200).json(await decorate((data ?? []).filter((p) => !hidden.has(p.id)), req.userId));
})

/** One post. A hidden post opens only for its author and for moderators (e.g. from the report queue). */
router.get("/post/:pid/fetch", optionalAuth, async (req: Request, res: Response) => {
    const pid = String(req.params.pid);
    const { data: post, error } = await supabase.from("v_post_all_data").select("*").eq("id", pid).maybeSingle();
    if (error) throw error;
    if (!post) return res.status(404).json({ message: "Post not found" });

    const h = (await hiddenPosts()).get(pid);
    if (h) {
        const isOwner = !!req.userId && req.userId === h.user_id;
        const isMod = !isOwner && await isModerator(req.userId);
        if (!isOwner && !isMod) return res.status(404).json({ message: "Post not found" });
        return res.status(200).json({ ...post, is_hidden: true, hidden_reason: h.hidden_reason, hidden_at: h.hidden_at, is_mine: isOwner });
    }
    const [withOwner] = await withOwnership([post], req.userId);
    res.status(200).json(withOwner);
})

export default router;
