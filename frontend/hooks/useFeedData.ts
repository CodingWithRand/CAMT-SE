import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from '@/components/AuthContext';
import type { Post, ReactionType, ReportStatus } from '@/lib/data';
import { buildThreads, groupModReports, toCategories, toPost } from '@/lib/mappers';
import type { SetState } from '@/lib/state';

export type FeedStatus = 'loading' | 'ready' | 'error';

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

  // Raw payloads last applied: a refresh that brings the same data skips the update,
  // so live refreshes don't re-render the feed or re-fetch every comment thread.
  const lastPayload = useRef<{ posts?: string; announce?: string }>({});

  const loadCats = useCallback(async () => {
    const res = await api('/misc/categories').catch(() => null);
    if (res?.ok) set({ cats: toCategories(await res.json()) });
  }, [api, set]);

  const loadPosts = useCallback(async () => {
    try {
      const rows = await (await api('/post/fetch')).json();
      if (!Array.isArray(rows)) throw new Error(rows?.message ?? 'bad /post/fetch payload');
      setFeedStatus('ready');
      const sig = JSON.stringify(rows);
      if (sig === lastPayload.current.posts) return;
      lastPayload.current.posts = sig;
      // my_reaction comes from the API, so the viewer's reaction survives a reload.
      const likes: Record<string, ReactionType> = {};
      rows.forEach((p: any) => { if (p.my_reaction) likes[p.id] = p.my_reaction; });
      set({ posts: rows.filter((p: any) => !hiddenLocally(p.id)).map(toPost), likes });
    } catch (err) {
      console.error('loadPosts', err);
      // Keep what is on screen if a later refresh fails; only an empty feed shows the error.
      setFeedStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, [api, set, hiddenLocally]);

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
    if (!ids.length) return;
    const res = await api(`/comment/fetch-many?pids=${ids.join(',')}`).catch(() => null);
    if (!res?.ok) return;
    const { threads, mine } = buildThreads(await res.json(), ids);
    set((prev) => ({ comments: { ...prev.comments, ...threads }, cLikes: { ...prev.cLikes, ...mine } }));
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

  const retryFeed = useCallback(() => { setFeedStatus('loading'); loadPosts(); loadAnnouncements(); }, [loadPosts, loadAnnouncements]);

  return {
    feedStatus, retryFeed, interestsLoaded,
    loadCats, loadPosts, loadAnnouncements, loadComments, loadNotifs, loadInterests, refreshReports,
  };
}
