import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from '@/components/AuthContext';
import type { Post, ReactionType, ReportStatus } from '@/lib/data';
import { buildThreads, groupModReports, toCategories, toPost } from '@/lib/mappers';
import type { SetState } from '@/lib/state';

export type FeedStatus = 'loading' | 'ready' | 'error';

const PAGE = 10;
const REFRESH_MAX = 100;   // the API's page cap
const COMMENT_BATCH = 100;   // post ids per /comment/fetch-many request (the API allows 200)

// Page cursors are "<created_at>|<id>" (see GET /post/fetch); only the time matters here.
const cursorTime = (cursor: string) => new Date(cursor.split('|')[0]).getTime();
/** Whether `p` sorts at or before the cursor (newest first, id breaking ties), i.e. inside the refreshed range. */
const newerThan = (p: Post, cursor: string) => {
  const t = new Date(p.at ?? 0).getTime(), c = cursorTime(cursor);
  return t > c || (t === c && p.id >= cursor.split('|')[1]);
};

/**
 * Everything the page reads from the API, written into page state.
 * Each loader is safe to call again at any time (live updates, polling, after a write).
 * `hiddenLocally` keeps posts that are about to be deleted or hidden (undo window) out of a refresh.
 */
export function useFeedData(set: SetState, opts: { signedIn: boolean; isMod: boolean; hiddenLocally: (id: string) => boolean }) {
  const api = useApi();
  const { signedIn, isMod, hiddenLocally } = opts;
  const [feedStatus, setFeedStatus] = useState<FeedStatus>('loading');
  const [interestsLoaded, setInterestsLoaded] = useState(false);
  const [nextBefore, setNextBefore] = useState<string | null>(null);   // cursor of the next feed page; null = no more
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const pages = useRef(1);   // feed pages loaded so far, so a refresh re-reads all of them

  // Raw payloads last applied: a refresh that brings the same data skips the update,
  // so live refreshes don't re-render the feed or re-fetch every comment thread.
  const lastPayload = useRef<{ posts?: string; announce?: string }>({});

  const loadCats = useCallback(async () => {
    const res = await api('/misc/categories').catch(() => null);
    if (res?.ok) set({ cats: toCategories(await res.json()) });
  }, [api, set]);

  /** Merge a page of API rows into the feed; my_reaction comes along so the viewer's reaction survives a reload. */
  const takeRows = useCallback((rows: any[]) => {
    const likes: Record<string, ReactionType> = {};
    rows.forEach((p) => { if (p.my_reaction) likes[p.id] = p.my_reaction; });
    return { posts: rows.filter((p) => !hiddenLocally(p.id)).map(toPost), likes };
  }, [hiddenLocally]);

  /**
   * (Re)load the feed from the top, as many pages as are already on screen. Older posts
   * loaded beyond that range stay, so a live refresh never shortens a long scroll.
   */
  const loadPosts = useCallback(async () => {
    try {
      const limit = Math.min(PAGE * pages.current, REFRESH_MAX);
      const body = await (await api(`/post/fetch?limit=${limit}`)).json();
      if (!Array.isArray(body?.posts)) throw new Error(body?.message ?? 'bad /post/fetch payload');
      setFeedStatus('ready');
      const sig = JSON.stringify(body);
      if (sig === lastPayload.current.posts) return;
      lastPayload.current.posts = sig;
      const page = takeRows(body.posts);
      const cursor: string | null = body.next_before;
      set((prev) => ({
        posts: cursor ? [...page.posts, ...prev.posts.filter((p) => !newerThan(p, cursor) && !page.posts.some((x) => x.id === p.id))] : page.posts,
        likes: { ...prev.likes, ...page.likes },
      }));
      // Only move the cursor when the refresh reached past it (first load, or nothing older was loaded).
      setNextBefore((old) => (old === null || !cursor || cursorTime(cursor) <= cursorTime(old) ? cursor : old));
    } catch (err) {
      console.error('loadPosts', err);
      // Keep what is on screen if a later refresh fails; only an empty feed shows the error.
      setFeedStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, [api, set, takeRows]);

  /** The next (older) page, when scrolling reaches the end of the feed. */
  const loadMore = useCallback(async () => {
    if (!nextBefore || loadingMore) return;
    setLoadingMore(true);
    const res = await api(`/post/fetch?limit=${PAGE}&before=${encodeURIComponent(nextBefore)}`).catch(() => null);
    setLoadingMore(false);
    if (!res?.ok) return;
    const body = await res.json();
    const page = takeRows(body.posts ?? []);
    pages.current += 1;
    set((prev) => ({
      posts: [...prev.posts, ...page.posts.filter((p) => !prev.posts.some((x) => x.id === p.id))],
      likes: { ...prev.likes, ...page.likes },
    }));
    setNextBefore(body.next_before ?? null);
  }, [api, set, takeRows, nextBefore, loadingMore]);

  /** Search every post on the server; an empty query leaves search mode. */
  const searchSeq = useRef(0);   // only the newest search may write its results
  const search = useCallback(async (q: string, keepShown = false) => {
    const seq = ++searchSeq.current;
    if (!q.trim()) { setSearching(false); return set({ results: null }); }
    setSearching(true);
    if (!keepShown) set({ results: null });   // a new term shows the loading cards, not the last term's results
    const res = await api(`/post/search?q=${encodeURIComponent(q.trim())}`).catch(() => null);
    const rows = res?.ok ? await res.json() : [];
    if (seq !== searchSeq.current) return;
    setSearching(false);
    const page = takeRows(rows);
    set((prev) => ({ results: page.posts, likes: { ...prev.likes, ...page.likes } }));
  }, [api, set, takeRows]);

  /** The viewer's own posts, hidden ones included, for the profile page. */
  const loadMine = useCallback(async () => {
    if (!signedIn) return set({ mine: null });
    const res = await api('/post/mine').catch(() => null);
    if (!res?.ok) return;
    const page = takeRows(await res.json());
    set((prev) => ({ mine: page.posts, likes: { ...prev.likes, ...page.likes } }));
  }, [api, set, takeRows, signedIn]);

  // Announcements load separately from the feed, so they show even when not in the feed.
  const loadAnnouncements = useCallback(async () => {
    const res = await api('/post/fetch/announcement').catch(() => null);
    if (!res?.ok) return;
    const rows = await res.json();
    const sig = JSON.stringify(rows);
    if (sig === lastPayload.current.announce) return;
    lastPayload.current.announce = sig;
    set({ announce: rows.filter((p: any) => !hiddenLocally(p.id)).map(toPost) });
  }, [api, set, hiddenLocally]);

  /** Load the comment threads of `posts` in one request; threads of other posts are kept. */
  const loadComments = useCallback(async (posts: Pick<Post, 'id'>[]) => {
    const ids = [...new Set(posts.map((p) => p.id))];
    for (let i = 0; i < ids.length; i += COMMENT_BATCH) {
      const batch = ids.slice(i, i + COMMENT_BATCH);
      const res = await api(`/comment/fetch-many?pids=${batch.join(',')}`).catch(() => null);
      if (!res?.ok) continue;
      const { threads, mine } = buildThreads(await res.json(), batch);
      set((prev) => ({ comments: { ...prev.comments, ...threads }, cLikes: { ...prev.cLikes, ...mine } }));
    }
  }, [api, set]);

  const loadNotifs = useCallback(async () => {
    if (!signedIn) return set({ notifs: [] });
    const res = await api('/notification/fetch/').catch(() => null);
    if (res?.ok) set({ notifs: await res.json() });
  }, [api, set, signedIn]);

  // Followed categories (user_interests); they decide who gets announcement notifications.
  const loadInterests = useCallback(async () => {
    setInterestsLoaded(false);
    if (!signedIn) return set({ interests: [] });
    const res = await api('/user/interests').catch(() => null);
    if (!res?.ok) return;
    const rows: { category_name: string }[] = await res.json();
    set({ interests: rows.map((r) => r.category_name).filter(Boolean) });
    setInterestsLoaded(true);
  }, [api, set, signedIn]);

  /** Report status of every reported post. Public, so everyone sees which posts are under review. */
  const loadReportStatus = useCallback(async () => {
    const res = await api('/report/status').catch(() => null);
    if (!res?.ok) return console.error('loadReportStatus', res?.status);
    const rows: { post_id: string; status: ReportStatus; report_count: number; reported_by_me: boolean }[] = await res.json();
    const reportStatus: Record<string, ReportStatus> = {};
    const reportCount: Record<string, number> = {};
    const myReports: Record<string, boolean> = {};
    rows.forEach((r) => {
      reportStatus[r.post_id] = r.status;
      reportCount[r.post_id] = r.report_count;
      if (r.reported_by_me) myReports[r.post_id] = true;
    });
    set({ reportStatus, reportCount, myReports });
  }, [api, set]);

  /** Every ticket with reasons and reporters, grouped by post. Moderators only. */
  const loadModReports = useCallback(async () => {
    // Not a moderator (or just signed out): drop any queue left from a mod session.
    if (!isMod || !signedIn) return set({ modReports: [], reportReason: {} });
    const [res, hiddenRes] = await Promise.all([api('/report/fetch'), api('/post/hidden')]);
    if (!res.ok) {
      // 401/403: the session just ended or the role changed; the next load sorts it out.
      return console.warn('loadModReports', res.status);
    }
    set(groupModReports(await res.json(), hiddenRes.ok ? await hiddenRes.json() : []));
  }, [api, set, isMod, signedIn]);

  const refreshReports = useCallback(() => Promise.all([loadReportStatus(), loadModReports()]), [loadReportStatus, loadModReports]);

  useEffect(() => { loadCats(); }, [loadCats]);
  useEffect(() => { loadPosts(); }, [loadPosts]);
  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);
  useEffect(() => { loadNotifs(); }, [loadNotifs]);
  useEffect(() => { loadInterests(); }, [loadInterests]);
  useEffect(() => { loadReportStatus(); }, [loadReportStatus]);
  useEffect(() => { loadModReports(); }, [loadModReports]);

  useEffect(() => { if (!signedIn) set({ mine: null }); }, [signedIn, set]);

  const retryFeed = useCallback(() => { setFeedStatus('loading'); loadPosts(); loadAnnouncements(); }, [loadPosts, loadAnnouncements]);

  return {
    feedStatus, retryFeed, interestsLoaded,
    hasMore: nextBefore !== null, loadingMore, loadMore, searching, search, loadMine,
    loadCats, loadPosts, loadAnnouncements, loadComments, loadNotifs, loadInterests, refreshReports,
  };
}
