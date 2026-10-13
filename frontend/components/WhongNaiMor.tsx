'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CATS, COMMENTS, ME, POSTS, QA, STATUSES,
  catDots, updateCommentLikesById,
  type Comment, type Post, type ReactionType, type ReportStatus,
} from '@/lib/data';
import { ACCENT_MAP, REPORT_LABEL, avatarStyle, likeCount, statusLook } from '@/lib/ui';
import { useAuthContext } from './AuthContext';
import { supabase } from '@/lib/dbauth';
import PostCard from './PostCard';
import PostModal from './PostModal';
import { ComposeDialog, DeleteDialog, EditDialog, HideDialog, ReportDialog } from './Dialogs';
import { LoginDialog, type AuthMode } from './LoginDialog';
import { AccountMenu } from './AccountMenu';
import { TopBar } from './TopBar';
import { ModerationCenter } from './ModerationCenter';
import { CategoryManager } from './CategoryManager';
import { RoleManager } from './RoleManager';

export type ViewerRole = 'student' | 'moderator' | 'guest';
type View = 'home' | 'announce' | 'interests' | 'questions' | 'moderation';

/** A file picked in the composer; `url` is an object URL used only for the preview. */
export interface NewMedia { id: string; type: 'image' | 'video'; label: string; file: File; url: string }

/** All reports on one post, grouped for the moderator queue. */
export interface ModReport {
  post_id: string;
  title: string;
  status: ReportStatus;
  hidden: boolean;
  hiddenReason?: string | null;
  tickets: { reason: string; by: string; at: string }[];
}

export interface Notif { id: string; post_id: string; message: string; is_read: boolean; created_at: string }

export interface AppState {
  view: View;
  activeId: string | null;
  cat: string | null;
  q: string;
  likes: Record<string, ReactionType>;      // post id -> this viewer's reaction
  cLikes: Record<string, ReactionType>;     // comment id -> this viewer's reaction
  comments: Record<string, Comment[]>;
  posts: Post[];
  announce: Post[];
  extraPosts: Post[];
  notifs: Notif[];
  interests: string[];
  reportStatus: Record<string, ReportStatus>;   // keyed by post id, visible to everyone
  reportCount: Record<string, number>;          // keyed by post id
  myReports: Record<string, boolean>;           // posts this viewer has reported
  reportReason: Record<string, string>;         // keyed by post id, newest reason (moderators only)
  modReports: ModReport[];                      // moderator queue
  draft: string;
  composerOpen: boolean;
  replyTo: string | null;
  replyDraft: string;
  openReplies: Record<string, boolean>;
  shown: number;
  composeOpen: boolean;
  newTitle: string;
  newText: string;
  newCats: string[];
  newMedia: NewMedia[];
  newImportant: boolean;
  reportFor: string | null;
  reason: string | null;
  editFor: string | null;
  hideFor: string | null;   // post the hide dialog is open for
  deleteFor: string | null; // post the delete confirmation is open for
  editTitle: string;
  editBody: string;
  editCats: string[];
  editImportant: boolean;
  notifOpen: boolean;
  login: AuthMode | null;   // which tab of the login dialog is open, if any
  toast: string | null;
  CATS: { id: any; name: string; pri: number; dot: string }[];
  w: number;
}

export type SetState = (patch: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => void;

const INITIAL: AppState = {
  view: 'home', activeId: null, cat: null, q: '',
  // posts/comments start empty and are filled from the API. Seeding them with
  // the mock rows fired /comment/fetch/p1 before the real posts arrived, and the
  // API rejects a non-uuid id — the error body then crashed the thread builder.
  likes: {}, cLikes: {}, comments: {}, posts: [], announce: [], extraPosts: [], notifs: [], interests: [],
  reportStatus: {},
  reportReason: {},
  reportCount: {},
  myReports: {},
  modReports: [],
  draft: '', composerOpen: false, replyTo: null, replyDraft: '', openReplies: {}, shown: 12,
  composeOpen: false, newTitle: '', newText: '', newCats: [], newMedia: [], newImportant: false,
  reportFor: null, reason: null,
  editFor: null, hideFor: null, deleteFor: null, editTitle: '', editBody: '', editCats: [], editImportant: false,
  notifOpen: false, login: null, toast: null,
  CATS: CATS,
  w: 1280,
};

interface Props {
  accentColor?: string;
  viewerRole?: ViewerRole;
  laneMode?: 'single' | 'two';
}

const API_URL = "http://localhost:3030";

const STATUS_TOAST: Record<ReportStatus, string> = {
  Open: 'ส่งกลับไปรอตรวจแล้ว',
  Reviewed: 'จัดการแล้ว · แจ้งผลให้ผู้รายงานแล้ว',
  Dismissed: 'ไม่พบปัญหา · แจ้งผลให้ผู้รายงานแล้ว',
};

export default function WhongNaiMor({ accentColor = '#7d50a8', viewerRole, laneMode = 'single' }: Props) {
  const [st, setRaw] = useState<AppState>(INITIAL);
  const set: SetState = useCallback((patch) => {
    setRaw((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ids = useRef({ comment: 0, post: 0, media: 0 });

  // Needed to sign the comment / reply / reaction writes; reads stay public,
  // but a signed-in reader also gets my_reaction back on the fetch routes.
  const { user, session, signOut } = useAuthContext();
  const [accountOpen, setAccountOpen] = useState(false);
  const [modSection, setModSection] = useState<'reports' | 'categories' | 'roles'>('reports');
  const [rolesRev, setRolesRev] = useState(0);

  const authHeaders = useCallback((extra: Record<string, string> = {}): Record<string, string> =>
    (session?.access_token ? { ...extra, Authorization: `Bearer ${session.access_token}` } : extra),
    [session]);

  /**
   * Who is viewing, taken from users.is_mod.
   *
   * Read straight from Supabase rather than through /user/current/fetch: that
   * endpoint filters v_user_all_data on a `uid` column the view does not have,
   * so it fails for every user. The table is the same source either way.
   */
  const [me, setMe] = useState<{ display_name: string; is_mod: boolean } | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);

  // Reloaded when a moderator changes someone's role (live "roles" hint), so a new
  // moderator gets their tools without signing in again.
  const loadMe = useCallback(async (isCancelled: () => boolean = () => false) => {
    if (!user?.id) { setMe(null); setRoleLoaded(true); return; }
    const res = await fetch(`${API_URL}/user/current/fetch`, { headers: authHeaders({ "Content-Type": "application/json" }) }).catch(() => null);
    if (isCancelled()) return;
    if (!res?.ok) {
      console.warn('load viewer', res?.status);
      setMe(null);
      setRoleLoaded(true);
      return;
    }
    const data = await res.json();
    setMe({ display_name: data.display_name, is_mod: !!data.is_mod });
    setRoleLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, session?.access_token]);

  useEffect(() => {
    let cancelled = false;
    loadMe(() => cancelled);
    return () => { cancelled = true; };
  }, [loadMe]);

  // The prop still wins, so a role can be forced while demoing.
  // `me` is cleared one render after sign-out, so also require a user: otherwise that render
  // still counts as a moderator and fires mod-only requests without a token (401).
  const prevIsMod = useRef<boolean | null>(null);
  useEffect(() => {
    const now = me ? me.is_mod : null;
    if (prevIsMod.current !== null && now !== null && now !== prevIsMod.current) {
      flash(now ? 'คุณได้รับสิทธิ์ผู้ดูแลแล้ว · เมนู "ศูนย์ผู้ดูแล" อยู่ทางซ้าย' : 'สิทธิ์ผู้ดูแลของคุณถูกยกเลิกแล้ว');
    }
    prevIsMod.current = now;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const role: ViewerRole = viewerRole ?? (me && user ? (me.is_mod ? 'moderator' : 'student') : 'guest');
  const isGuest = role === 'guest';
  const isMod = role === 'moderator';

  const flash = useCallback((t: string) => {
    set({ toast: t });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => set({ toast: null }), 2400);
  }, [set]);
  // A guest trying to write gets the login window instead of a dead end.
  const gate = () => set({ login: 'login', notifOpen: false });

  function getTimeAgo(stamp: Date | string) {
    const now = new Date().getTime();
    const publishedDate = new Date(stamp).getTime();
    const diffInSeconds = Math.floor((now - publishedDate) / 1000);
    if (diffInSeconds < 60) {
        return diffInSeconds + ` วินาทีที่แล้ว`;
    } else if (diffInSeconds < (60 * 60)) {
        const minutes = Math.floor(diffInSeconds / (60));
        return minutes + ` นาทีที่แล้ว`;
    } else if (diffInSeconds < (60 * 60 * 24)) {
        const hours = Math.floor(diffInSeconds / (60 * 60));
        return hours + ` ชั่วโมงที่แล้ว`;
    } else if (diffInSeconds < (60 * 60 * 24 * 30)) {
        const days = Math.floor(diffInSeconds / (60 * 60 * 24));
        return days + ` วันที่แล้ว`;
    } else if (diffInSeconds < (60 * 60 * 24 * 30 * 12)) {
        const months = Math.floor(diffInSeconds / (60 * 60 * 24 * 30));
        return months + ` เดือนที่แล้ว`;
    } else {
        const years = Math.floor(diffInSeconds / (60 * 60 * 24 * 30 * 12));
        return years + ` ปีที่แล้ว`;
    }
  }

  // Categories: loaded at start and again when a moderator adds or edits one (live "categories" hint).
  const loadCats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/misc/categories`);
      if (!res.ok) return;
      const newCats = await res.json();
      const dots = catDots(newCats.map((c: any) => String(c.id)));
      setRaw((prev) => ({ ...prev, CATS: newCats.map((c: any) => ({ id: c.id, name: c.category_name, pri: c.priority, dot: dots[c.id] })) }));
    } catch (err) { console.error('loadCats', err); }
  }, [])

  useEffect(() => { loadCats(); }, [loadCats])

  useEffect(() => {
    console.log(st.CATS);
  }, [st.CATS])

  const toFrontendPost = (p: any): Post => ({
    id: p.id,
    important: p.is_important,
    name: p.author_name,
    time: getTimeAgo(p.created_at),
    initials: p.author_name.slice(0, 2),
    title: p.title,
    body: p.content,
    role: p.role,
    cats: p.categories.map((c: any) => c.name),
    likes: p.reaction_count,
    media: (p.medias ?? []).map((m: any) => ({ type: m.media_type, label: '', url: m.file_url })),
    hidden: p.is_hidden ? { reason: p.hidden_reason ?? null } : undefined,
    mine: !!p.is_mine,
    // Stored edits (api/sql/2026-10-13_post_edits.sql), so the label survives a reload.
    edited: p.edited_at ? (p.edited_by_mod ? 'แก้ไขโดยผู้ดูแล' : 'แก้ไขแล้ว') : undefined,
  });

  // Load post (comment count doesn't show)
  // Raw API payloads last applied; a refresh that brings the same data skips the update,
  // so live refreshes don't re-render the feed or re-fetch every comment thread.
  const lastPayload = useRef<{ posts?: string; announce?: string }>({});

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/post/fetch`, { headers: authHeaders() });
      const ps = await res.json();
      if (!Array.isArray(ps)) throw new Error(ps?.message ?? 'bad /post/fetch payload');
      const sig = JSON.stringify(ps);
      if (sig === lastPayload.current.posts) return;
      lastPayload.current.posts = sig;
      const frontendPosts: Post[] = ps.map(toFrontendPost);
      // my_reaction comes from the API, so the filled heart survives a reload.
      // Without it the next tap would remove a reaction the UI thinks it is adding.
      const mine: Record<string, ReactionType> = {};
      ps.forEach((p: any) => { if (p.my_reaction) mine[p.id] = p.my_reaction; });
      set({ posts: frontendPosts, likes: mine });
    } catch (err) { console.error(err); }
  }, [set, session])

  useEffect(() => { loadPosts(); }, [loadPosts])

  // Load announcements separately from the feed, so they show even when not in the feed
  const loadAnnouncements = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/post/fetch/announcement`);
      if (!res.ok) return;
      const ps = await res.json();
      const sig = JSON.stringify(ps);
      if (sig === lastPayload.current.announce) return;
      lastPayload.current.announce = sig;
      set({ announce: ps.map(toFrontendPost) });
    } catch (err) { console.error(err); }
  }, [set])

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements])

  // Load notifications of the signed in user (from the notifications table)
  const loadNotifs = useCallback(async () => {
    if (!session?.access_token) return set({ notifs: [] });
    try {
      const res = await fetch(`${API_URL}/notification/fetch/`, { headers: authHeaders() });
      if (!res.ok) return;
      set({ notifs: await res.json() });
    } catch (err) { console.error(err); }
  }, [set, session?.access_token])

  useEffect(() => { loadNotifs(); }, [loadNotifs])

  // The signed-in user's interests, stored in user_interests (they decide who gets announcement notifications).
  const loadInterests = useCallback(async () => {
    if (!session?.access_token) return set({ interests: [] });
    try {
      const res = await fetch(`${API_URL}/user/interests`, { headers: authHeaders() });
      if (!res.ok) return;
      const rows: { category_name: string }[] = await res.json();
      set({ interests: rows.map((r) => r.category_name).filter(Boolean) });
    } catch (err) { console.error('loadInterests', err); }
  }, [set, session?.access_token])

  useEffect(() => { loadInterests(); }, [loadInterests])

  const toggleInterest = async (name: string) => {
    if (isGuest) return gate();
    const before = st.interests;
    const has = before.includes(name);
    const next = has ? before.filter((x) => x !== name) : [...before, name];
    set({ interests: next });
    const ids = next.map((n) => st.CATS.find((c) => c.name === n)?.id).filter(Boolean);
    const res = await fetch(`${API_URL}/user/interests`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ cate_id: ids }),
    }).catch((err) => console.log(err));
    if (!res?.ok) {
      set({ interests: before });
      return flash('บันทึกความสนใจไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    flash(has ? 'ลบออกจากความสนใจแล้ว' : 'บันทึกเป็นความสนใจแล้ว · จะได้รับแจ้งเตือนประกาศในหมวดนี้');
  };

  // load comment per post
  /**
   * Load the comment threads of `posts` in one request and merge them into state;
   * threads of other posts are kept. (It used to be one request per post, every refresh.)
   */
  const loadComments = useCallback(async (posts: Post[]) => {
      const pids = [...new Set(posts.map((p) => p.id))];
      if (!pids.length) return;
      // Signed in, the API tags each row with my_reaction; signed out it sends null.
      const res = await fetch(`${API_URL}/comment/fetch-many?pids=${pids.join(',')}`, { headers: authHeaders() }).catch(() => null);
      if (!res?.ok) return;
      const rows: any[] = await res.json();
      const byPost: Record<string, any[]> = Object.fromEntries(pids.map((id) => [id, []]));
      rows.forEach((c) => byPost[c.post_id]?.push(c));
      let fetchedComments: any[][] = Object.values(byPost);
      const mineC: Record<string, ReactionType> = {};

      interface CommentNode {
        id: string | number;
        post_id: string;
        parent_comment_id: string | number | null;
        display_name: string;
        role: string;
        content: string;
        created_at: string;
        reaction_count?: number;
        my_reaction?: string | null;
        replies?: CommentNode[];
      }
      const rootComments: CommentNode[] & Comment[] = [];
      const postComments: { [pid: string]: CommentNode[] & Comment[] } = {};

      for(let pcs of fetchedComments) {
        // A failed fetch answers with { code, message }, which has no .length —
        // the old `pcs.length === 0` check let it through and .map then threw.
        if(!Array.isArray(pcs) || pcs.length === 0) continue
        // Remember which of these the viewer has reacted to before reshaping.
        pcs.forEach((c: any) => { if (c.my_reaction) mineC[c.id] = c.my_reaction; });
        pcs = pcs.map((c: CommentNode) => ({
          post_id: c.post_id,
          id: c.id,
          parent_comment_id: c.parent_comment_id,
          a: c.display_name,
          r: c.role,
          i: c.display_name.slice(0, 2),
          time: getTimeAgo(c.created_at),
          text: c.content,
          likes: c.reaction_count ?? 0,
          t: 3, //placeholder
        }))

        const map = new Map();

        // Step 1: Clone nodes into map with initialized empty replies array
        pcs.forEach((comment: Comment & CommentNode) => {
          map.set(comment.id, { ...comment, replies: [] });
        });

        // Step 2: Assemble parent-child linkages in a single pass O(N)
        pcs.forEach((comment: Comment & CommentNode) => {
          const node = map.get(comment.id)!;
          
          if (comment.parent_comment_id !== null && map.has(comment.parent_comment_id)) {
            // Attach to parent's replies array
            map.get(comment.parent_comment_id)!.replies!.push(node);
          } else {
            // Top-level root comment
            rootComments.push(node);
          }
        });
        // console.log(rootComments[0].id)
        postComments[pcs[0].post_id] = rootComments.map((rc) => rc) as CommentNode[] & Comment[];
        // console.log(postComments[pcs[0].post_id][0].id, pcs[0].post_id)
        rootComments.length = 0;
      }
      // console.log(postComments['33333333-3333-3333-3333-333333333332'][0].id)
      // Posts asked for but without comments get an empty thread, so a deleted comment disappears.
      pids.forEach((id) => { if (!postComments[id]) postComments[id] = [] as any; });
      set((prev) => ({ comments: { ...prev.comments, ...postComments }, cLikes: { ...prev.cLikes, ...mineC } }));
  }, [set, session]);

  // Comments for every loaded post: the feed, the announcement rail and posts opened from a notification
  const loadedPosts = useMemo(() => {
    const all = [...st.posts, ...st.announce, ...st.extraPosts];
    return all.filter((p, i) => all.findIndex((x) => x.id === p.id) === i);
  }, [st.posts, st.announce, st.extraPosts]);

  useEffect(() => { loadComments(loadedPosts); }, [loadedPosts, loadComments]);

  /**
   * POST a comment, or a reply when parentId is given, then re-read the thread.
   *
   * Both create endpoints answer with an empty 200, and the row the UI needs
   * carries joined fields (display_name, role) that the insert does not return —
   * so the thread is re-fetched instead of being patched together on the client.
   */
  const postComment = useCallback(async (postId: string, text: string, parentId?: string) => {
    const url = parentId
      ? `${API_URL}/comment/${postId}/replyto/${parentId}`
      : `${API_URL}/comment/${postId}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const target = findPost(postId);
      if (target) await loadComments([target]);
      return true;
    } catch (err) {
      console.error('postComment', err);
      return false;
    }
  }, [session, loadComments, loadedPosts]);

  /** Report status of every reported post. Public, so everyone sees which posts are under review. */
  const loadReportStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/report/status`, { headers: authHeaders() });
      if (!res.ok) throw new Error(String(res.status));
      const rows: { post_id: string; status: ReportStatus; report_count: number; reported_by_me: boolean }[] = await res.json();
      const status: Record<string, ReportStatus> = {};
      const count: Record<string, number> = {};
      const mine: Record<string, boolean> = {};
      rows.forEach((r) => {
        status[r.post_id] = r.status;
        count[r.post_id] = r.report_count;
        if (r.reported_by_me) mine[r.post_id] = true;
      });
      set({ reportStatus: status, reportCount: count, myReports: mine });
    } catch (err) { console.error('loadReportStatus', err); }
  }, [set, session]);

  /** Every ticket with reasons and reporters, grouped by post. Moderators only. */
  const loadModReports = useCallback(async () => {
    // Not a moderator (or just signed out): drop any queue left from a mod session.
    if (!isMod || !session?.access_token) return set({ modReports: [], reportReason: {} });

    const [res, hiddenRes] = await Promise.all([
      fetch(`${API_URL}/report/fetch`, { headers: authHeaders() }),
      fetch(`${API_URL}/post/hidden`, { headers: authHeaders() }),
    ]);
    if (!res.ok) {
      // 401/403: the session just ended or the role changed; the next load sorts it out.
      const log = res.status === 401 || res.status === 403 ? console.warn : console.error;
      log('loadModReports', res.status, await res.json().catch(() => null));
      return;
    }
    const data: any[] = await res.json();

    const groups = new Map<string, ModReport>();
    const reason: Record<string, string> = {};
    for (const r of data) {
      if (!groups.has(r.post_id)) {
        groups.set(r.post_id, { post_id: r.post_id, title: r.post?.title || 'ไม่มีชื่อ', status: r.status, hidden: !!r.post_hidden, tickets: [] });
      }
      const g = groups.get(r.post_id)!;
      g.tickets.push({ reason: r.reason, by: r.reporter?.display_name ?? 'ไม่ทราบชื่อ', at: r.created_at });
      // Tickets arrive oldest first, so the last one seen is the newest.
      reason[r.post_id] = r.reason;
      if (r.status === 'Open') g.status = 'Open';
      else if (g.status !== 'Open') g.status = r.status;
    }
    // Hidden posts belong in the "hidden" tab even without reports (hidden from the edit dialog),
    // otherwise a moderator could never find them again to unhide.
    const hidden: any[] = hiddenRes.ok ? await hiddenRes.json() : [];
    for (const h of hidden) {
      const g = groups.get(h.id);
      if (g) { g.hidden = true; g.hiddenReason = h.hidden_reason; continue; }
      groups.set(h.id, { post_id: h.id, title: h.title || 'ไม่มีชื่อ', status: 'Reviewed', hidden: true, hiddenReason: h.hidden_reason, tickets: [] });
    }
    set({ modReports: [...groups.values()], reportReason: reason });
  }, [isMod, set, session]);

  const refreshReports = useCallback(() => Promise.all([loadReportStatus(), loadModReports()]), [loadReportStatus, loadModReports]);

  useEffect(() => { loadReportStatus(); }, [loadReportStatus]);

  /**
   * Live updates. The API broadcasts which kind of data changed (see api/src/live.ts);
   * this re-fetches just that. A 30 s poll and a refresh when the tab regains focus
   * cover a missed broadcast or a dropped connection.
   */
  const live = useRef<Record<string, (postId?: string) => void>>({});
  live.current = {
    posts: () => { loadPosts(); loadAnnouncements(); },
    comments: (postId?: string) => {
      const one = postId ? loadedPosts.find((p) => p.id === postId) : undefined;
      loadComments(one ? [one] : loadedPosts);
    },
    reports: () => { refreshReports(); },
    notifications: () => { loadNotifs(); },
    categories: () => { loadCats(); },
    roles: () => { loadMe(); setRolesRev((v) => v + 1); },
  };
  useEffect(() => {
    const pending = new Set<string>();
    const commentPosts = new Set<string>();   // threads to reload; empty = all of them
    let allComments = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Several changes in a burst (e.g. hide = post + reports + notifications) become one refresh.
    const queue = (topics: string[], postId?: string) => {
      topics.forEach((t) => pending.add(t));
      if (topics.includes('comments')) { if (postId) commentPosts.add(postId); else allComments = true; }
      clearTimeout(timer);
      timer = setTimeout(() => {
        const due = [...pending];
        pending.clear();
        due.forEach((t) => {
          if (t !== 'comments') return live.current[t]?.();
          if (allComments || !commentPosts.size) live.current.comments?.();
          else commentPosts.forEach((id) => live.current.comments?.(id));
        });
        commentPosts.clear();
        allComments = false;
      }, 400);
    };

    const channel = supabase
      .channel('wnm-live')
      .on('broadcast', { event: 'changed' }, ({ payload }) => queue(Array.isArray(payload?.topics) ? payload.topics : [], payload?.post_id))
      .subscribe();

    const everything = ['posts', 'comments', 'reports', 'notifications', 'categories', 'roles'];
    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') queue(['posts', 'reports', 'notifications']);
    }, 30_000);
    const onBack = () => { if (document.visibilityState === 'visible') queue(everything); };
    document.addEventListener('visibilitychange', onBack);
    window.addEventListener('focus', onBack);

    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onBack);
      window.removeEventListener('focus', onBack);
      supabase.removeChannel(channel);
    };
  }, []);

  /** Send a report; resolves to an error message, or null on success. */
  const submitReport = useCallback(async (postId: string, reason: string) => {
    const res = await fetch(`${API_URL}/report/createticket`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ post_id: postId, reason }),
    });
    if (res.status === 409) {
      await refreshReports();
      return 'คุณรายงานโพสต์นี้ไปแล้ว · รอผู้ดูแลตรวจสอบ';
    }
    if (!res.ok) {
      console.error('submitReport', res.status, await res.json().catch(() => null));
      return 'ส่งรายงานไม่สำเร็จ ลองใหม่อีกครั้ง';
    }
    await refreshReports();
    return null;
  }, [authHeaders, refreshReports]);

  useEffect(() => { loadModReports(); }, [loadModReports]);

  // Accent palette
  useEffect(() => {
    const v = ACCENT_MAP[accentColor];
    if (!v) return;
    const r = document.documentElement.style;
    ['--color-accent', '--color-accent-600', '--color-accent-700', '--color-accent-200', '--color-accent-100', '--color-accent-800']
      .forEach((k, i) => r.setProperty(k, v[i]));
  }, [accentColor]);

  // Viewport width + Escape to close the post modal
  useEffect(() => {
    const onResize = () => set({ w: window.innerWidth });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') set({ activeId: null, replyTo: null }); };
    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      clearTimeout(toastTimer.current);
    };
  }, [set]);

  // Modal scroll lock
  const locked = !!(st.activeId || st.composeOpen || st.editFor || st.hideFor || st.deleteFor || st.reportFor || st.login);
  useEffect(() => {
    document.body.classList.toggle('wnm-locked', locked);
    document.documentElement.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.classList.remove('wnm-locked');
      document.documentElement.style.overflow = '';
    };
  }, [locked]);

  const wide = st.w >= 880;

  const visible = useMemo(() => {
    const needle = st.q.trim().toLowerCase();
    // This is ok for now (fronend filter), but in the future, fetch certain posts from the backend/db is better.
    return st.posts.filter((p) => {
      const cats = p.cats || [];
      if (st.view === 'announce' && !p.important) return false;
      if (st.view === 'interests' && !cats.some((c) => st.interests.includes(c))) return false;
      if (st.view === 'questions' && !cats.includes(QA)) return false;
      if (st.cat && !cats.includes(st.cat)) return false;
      if (needle && !`${p.title} ${p.body} ${p.name} ${cats.join(' ')}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [st.posts, st.view, st.interests, st.cat, st.q]);

  const feed = useMemo(
    () => [...visible].sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0)),
    [visible],
  );

  const findPost = (id: string | null) =>
    st.posts.find((p) => p.id === id) || st.announce.find((p) => p.id === id) || st.extraPosts.find((p) => p.id === id);
  /** The post, loading it by itself when it is not in the feed or announcements (e.g. from a notification). */
  const ensurePost = async (id: string): Promise<Post | null> => {
    const found = findPost(id);
    if (found) return found;
    const res = await fetch(`${API_URL}/post/${id}/fetch`);
    if (!res.ok) return null;
    const p = toFrontendPost(await res.json());
    set((prev) => ({ extraPosts: [...prev.extraPosts, p] }));
    return p;
  };
  const openPost = async (id: string) => {
    if (!(await ensurePost(id))) return flash('ไม่พบโพสต์นี้แล้ว');
    set({ activeId: id, notifOpen: false, replyTo: null, replyDraft: '', composerOpen: false, shown: 12 });
  };
  const openNotif = (n: Notif) => {
    if (!n.is_read && session?.access_token) {
      set((prev) => ({ notifs: prev.notifs.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)) }));
      fetch(`${API_URL}/notification/${n.id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      }).catch((err) => console.error(err));
    }
    openPost(n.post_id);
  };
  const unreadNotifs = st.notifs.filter((n) => !n.is_read).length;

  /** Mark every notification read: the badge clears at once, and comes back if the API refuses. */
  const readAllNotifs = async () => {
    const before = st.notifs;
    set({ notifs: before.map((n) => ({ ...n, is_read: true })) });
    const res = await fetch(`${API_URL}/notification/read-all`, { method: 'POST', headers: authHeaders() }).catch(() => null);
    if (!res?.ok) {
      set({ notifs: before });
      return flash('อ่านทั้งหมดไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    flash('อ่านการแจ้งเตือนทั้งหมดแล้ว');
  };

  /** Set the report status of post `id` (all of its tickets). The reporters get a notification. */
  const setStatus = async (id: string, next: ReportStatus) => {
    const before = st.reportStatus[id];
    const beforeQueue = st.modReports.find((r) => r.post_id === id)?.status;
    if ((beforeQueue ?? before) === next) return;
    // Optimistic: flip the chip and the queue now, roll back each to its own old value if the API refuses.
    const apply = (chip: ReportStatus | undefined, queue: ReportStatus | undefined) => set((prev) => ({
      reportStatus: chip ? { ...prev.reportStatus, [id]: chip } : prev.reportStatus,
      modReports: prev.modReports.map((r) => (r.post_id === id && queue ? { ...r, status: queue } : r)),
    }));
    apply(next, next);

    const res = await fetch(`${API_URL}/report/post/${id}/status`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      console.error('setStatus', res.status, await res.json().catch(() => null));
      apply(before, beforeQueue);
      return flash('เปลี่ยนสถานะไม่สำเร็จ');
    }
    flash(STATUS_TOAST[next]);
    refreshReports();
  };

  /** Hide a post (moderators): it leaves the feed, its open reports close as Reviewed, reporters and author are told. */
  const hidePost = async (id: string, reason: string) => {
    const res = await fetch(`${API_URL}/post/${id}/hide`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      console.error('hidePost', res.status, body);
      return flash(res.status === 501 ? 'ยังซ่อนไม่ได้ · ต้องรัน api/sql/2026-10-13_hide_posts.sql ใน Supabase ก่อน' : 'ซ่อนโพสต์ไม่สำเร็จ');
    }
    const hide = (list: Post[]) => list.filter((p) => p.id !== id);
    set((prev) => ({
      hideFor: null,
      activeId: prev.activeId === id ? null : prev.activeId,
      posts: hide(prev.posts),
      announce: hide(prev.announce),
      extraPosts: prev.extraPosts.map((p) => (p.id === id ? { ...p, hidden: { reason: reason || null } } : p)),
    }));
    flash('ซ่อนโพสต์แล้ว · แจ้งผู้รายงานและเจ้าของโพสต์แล้ว');
    refreshReports();
  };

  /** Delete a post for good: the author's own, or any post for a moderator. */
  const deletePost = async (id: string) => {
    const res = await fetch(`${API_URL}/post/${id}/delete`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) {
      console.error('deletePost', res.status, await res.json().catch(() => null));
      set({ deleteFor: null });
      return flash(res.status === 403 ? 'ลบได้เฉพาะโพสต์ของคุณ' : 'ลบโพสต์ไม่สำเร็จ');
    }
    const drop = (list: Post[]) => list.filter((p) => p.id !== id);
    set((prev) => ({
      deleteFor: null,
      activeId: prev.activeId === id ? null : prev.activeId,
      posts: drop(prev.posts), announce: drop(prev.announce), extraPosts: drop(prev.extraPosts),
    }));
    flash('ลบโพสต์แล้ว');
    refreshReports();
  };

  /** Show a hidden post again (moderators). */
  const unhidePost = async (id: string) => {
    const res = await fetch(`${API_URL}/post/${id}/unhide`, { method: 'PUT', headers: authHeaders() });
    if (!res.ok) {
      console.error('unhidePost', res.status, await res.json().catch(() => null));
      return flash('แสดงโพสต์อีกครั้งไม่สำเร็จ');
    }
    set((prev) => ({
      editFor: null,
      extraPosts: prev.extraPosts.map((p) => (p.id === id ? { ...p, hidden: undefined } : p)),
    }));
    flash('โพสต์กลับมาแสดงแล้ว');
    loadPosts();
    refreshReports();
  };

  const openEdit = async (id: string) => {
    const p = await ensurePost(id);
    if (!p) return flash('ไม่พบโพสต์นี้แล้ว');
    if (!isMod && !p.mine) return flash('แก้ไขได้เฉพาะโพสต์ของคุณ');
    set({ editFor: id, editTitle: p.title, editBody: p.body, editCats: [...(p.cats || [])], editImportant: !!p.important });
  };

  /**
   * Toggle this viewer's reaction through the API.
   *
   * POST /post/:pid/react and POST /comment/:cid/react both wrap an RPC that
   * flips the reaction server-side, so the body only names the type. The reply
   * shape is whatever that RPC returns, so rather than reading it we re-pull the
   * rows afterwards and take the counts from there.
   *
   * Heads up: both RPCs currently fail with
   *   42804 column "reaction_type" is of type reaction_type but expression is of type text
   * (the function passes `rtype` into the enum column without a cast), and
   * /post/:pid/react is also missing its auth middleware, so it sends
   * uid: undefined. Both are server-side fixes; this code needs no change once
   * they land.
   */
  const react = useCallback(async (kind: 'post' | 'comment', id: string, type: ReactionType = 'like', change: boolean) => {
    const url = kind === 'post' ? `${API_URL}/post/${id}/react` : `${API_URL}/comment/${id}/react`;
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ reaction_type: type, change}),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      // The two routes fail differently today, and the codes say which bug it is:
      //   42804   the RPC puts `rtype` text into the enum column without a cast
      //   PGRST202 no uid reached the RPC, so PostgREST looked for a 2-arg
      //            overload — /post/:pid/react is missing its auth middleware
      const known: Record<string, string> = {
        '42804': 'รีแอคไม่ได้ · RPC ฝั่ง DB ยังไม่ cast reaction_type',
        PGRST202: 'รีแอคไม่ได้ · /post/:pid/react ยังไม่มี auth เลยส่ง uid ไปไม่ครบ',
      };
      throw new Error(known[body?.code] ?? body?.message ?? `HTTP ${res.status}`);
    }
    return await res.json(); 
  }, [session]);

  /** Drop the key entirely when the reaction is cleared, so lookups stay falsy. */
  const withReaction = (map: Record<string, ReactionType>, id: string, next?: ReactionType) => {
    const copy = { ...map };
    if (next) copy[id] = next; else delete copy[id];
    return copy;
  };

  const reactToPost = useCallback(async (pid: string, type: ReactionType, change: boolean) => {
    const before = st.likes[pid];
    // Tapping the one already held clears it — same rule the endpoint applies.
    const next = before === type ? undefined : type;
    // Show the result right away (the API takes a moment); the server's count replaces it after.
    const delta = before && !next ? -1 : !before && next ? 1 : 0;
    const withCount = (list: Post[], count: (p: Post) => number) =>
      list.map((p) => (p.id === pid ? { ...p, likes: Math.max(0, count(p)) } : p));
    const applyCount = (count: (p: Post) => number) => set((prev) => ({
      posts: withCount(prev.posts, count), announce: withCount(prev.announce, count), extraPosts: withCount(prev.extraPosts, count),
    }));
    set((prev) => ({ likes: withReaction(prev.likes, pid, next) }));
    applyCount((p) => p.likes + delta);
    try {
      const serverCount = await react('post', pid, type, (before && !!next) && change);
      applyCount(() => serverCount);
    } catch (err: any) {
      console.error('reactToPost', err);
      set((prev) => ({ likes: withReaction(prev.likes, pid, before) }));
      applyCount((p) => p.likes - delta);
      flash(err.message);
    }
  }, [react, set, flash, st.likes]);

  const reactToComment = useCallback(async (pid: string, cid: string, type: ReactionType, change: boolean) => {
    const before = st.cLikes[cid];
    const next = before === type ? undefined : type;
    // set((prev) => ({ cLikes: withReaction(prev.cLikes, cid, next) }));
    console.log(before, next, change, (before && !!next) && change);
    try {
      const newCommentLikeCount = await react('comment', cid, type, (before && !!next) && change);
      console.log('newCommentLikeCount', newCommentLikeCount);
      // st.comments[cid];
      // updateCommentLikesById(st.comments, cid, newCommentLikeCount);
      set((prev) => ({ 
        ...prev, 
        cLikes: withReaction(prev.cLikes, cid, next),
        comments: {
          ...prev.comments,
          [pid]: prev.comments[pid].map((c) => 
            c.id === cid ? { ...c, likes: newCommentLikeCount } : 
            { ...c, replies: c.replies?.map((r) => r.id === cid ? { ...r, likes: newCommentLikeCount } : r) }
          )
        } 
      }));
      // await loadComments(st.posts);
    } catch (err: any) {
      console.error('reactToComment', err);
      set((prev) => ({ cLikes: withReaction(prev.cLikes, cid, before) }));
      flash(err.message);
    }
  }, [react, loadComments, set, flash, st.cLikes, st.posts]);

  const cardProps = (p: Post) => ({
    CATS: st.CATS,
    post: p,
    liked: st.likes[p.id] ?? null,
    commentCount: (st.comments[p.id] || []).length,
    reportStatus: st.reportStatus[p.id],
    isGuest,
    isMod,
    onReact: (r: ReactionType, change: boolean) => reactToPost(p.id, r, change),
    onGate: gate,
    onOpen: () => openPost(p.id),
    canEdit: !isGuest && (isMod || !!p.mine),
    onEdit: () => openEdit(p.id),
    onDelete: () => set({ deleteFor: p.id }),
    onReport: () => {
      if (isGuest) return gate();
      if (st.myReports[p.id] && st.reportStatus[p.id] === 'Open') return flash('คุณรายงานโพสต์นี้แล้ว · รอผู้ดูแลตรวจสอบ');
      set({ reportFor: p.id, reason: null });
    },
  });

  const railAnnounce = [...st.announce]
    .sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0) || b.likes - a.likes)
    .slice(0, 4);

  // Real display_name once it loads; ME is only the fallback in between.
  const meName = isGuest ? 'ผู้เยี่ยมชม' : (me?.display_name ?? ME.name);
  const meInitials = isGuest ? 'G' : meName.slice(0, 2);
  const meAvatar = avatarStyle(isGuest ? 3 : ME.tint, 34);

  const roleBanner = isGuest ? 'กำลังดูในฐานะผู้ใช้ภายนอก (Non-CMU) · อ่านได้เท่านั้น' : '';

  const openCompose = () => (isGuest ? gate() : set({ composeOpen: true, notifOpen: false }));
  const goHome = () => set({ activeId: null, replyTo: null, notifOpen: false });
  const closeLogin = useCallback(() => set({ login: null }), [set]);
  const onLoginDone = useCallback((registered: boolean) => {
    set({ login: null });
    flash(registered ? 'สร้างบัญชีเรียบร้อย · ยินดีต้อนรับสู่ WhongNaiMor' : 'เข้าสู่ระบบแล้ว');
  }, [set, flash]);

  const active = findPost(st.activeId);

  const openReportCount = st.modReports.filter((r) => r.status === 'Open').length;
  useEffect(() => { if (!isMod && st.view === 'moderation') set({ view: 'home' }); }, [isMod, st.view, set]);


  const shellCols = st.w >= 1060 ? '212px minmax(0,1fr) 292px' : wide ? '176px minmax(0,1fr) 224px' : 'minmax(0,1fr)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 60 }}>
      {/* ── Top bar ── */}
      <TopBar
        w={st.w}
        query={st.q}
        onQuery={(q) => set({ q })}
        onHome={goHome}
        signedIn={!!user}
        canPost={!isGuest}
        onCompose={openCompose}
        onLogin={(mode) => set({ login: mode, notifOpen: false })}
        notifs={st.notifs}
        unread={unreadNotifs}
        notifOpen={st.notifOpen}
        onNotifOpen={(o) => { if (o) setAccountOpen(false); set({ notifOpen: o }); }}
        onOpenNotif={openNotif}
        onReadAll={readAllNotifs}
        timeAgo={getTimeAgo}
        account={user && (
          <AccountMenu
            name={meName}
            initials={meInitials}
            email={user.email ?? ''}
            isMod={isMod}
            avatar={meAvatar}
            compact={st.w < 640}
            unread={unreadNotifs}
            open={accountOpen}
            onOpenChange={(o) => { setAccountOpen(o); if (o) set({ notifOpen: false }); }}
            onNotifications={() => set({ notifOpen: true })}
            onInterests={() => set({ view: 'interests', activeId: null, replyTo: null })}
            onSignOut={async () => {
              await signOut();
              setAccountOpen(false);
              flash('ออกจากระบบแล้ว · แล้วพบกันใหม่');
            }}
          />
        )}
      />

      <div style={{ maxWidth: 1220, margin: '0 auto', padding: 'clamp(14px,2vw,22px) clamp(12px,2.5vw,26px)', display: 'grid', gap: 'clamp(12px,1.6vw,20px)', gridTemplateColumns: shellCols, alignItems: 'start' }}>
        {/* ── Left: views + categories ── */}
        <aside style={{ display: 'flex', gap: wide ? 14 : 8, flexDirection: wide ? 'column' : 'row', flexWrap: 'wrap', position: wide ? 'sticky' : 'static', top: 84, minWidth: 0 }}>
          <nav style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: wide ? 16 : 999, padding: wide ? 8 : '5px 6px', display: 'flex', flexDirection: wide ? 'column' : 'row', gap: wide ? 2 : 4, flex: 'none', maxWidth: '100%', overflowX: wide ? 'visible' : 'auto' }}>
            {([['home', 'หน้าแรก'], ['announce', 'ประกาศ'], ['interests', 'หมวดที่ฉันสนใจ']] as const).map(([k, l]) => (
              <button
                key={k}
                className="hov-bg"
                onClick={() => set({ view: k, activeId: null, replyTo: null })}
                style={{ cursor: 'pointer', border: 0, textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 13, padding: '9px 12px', borderRadius: 10, background: st.view === k ? 'var(--color-accent-200)' : 'transparent', color: st.view === k ? 'var(--color-accent-800)' : 'var(--color-neutral-800)', fontWeight: st.view === k ? 600 : 400 }}
              >
                {l}
              </button>
            ))}
            {isMod && (
              <button
                className="hov-bg"
                onClick={() => set({ view: 'moderation', activeId: null, replyTo: null })}
                style={{ cursor: 'pointer', border: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13, padding: '9px 12px', borderRadius: 10, background: st.view === 'moderation' ? 'var(--color-accent-200)' : 'transparent', color: st.view === 'moderation' ? 'var(--color-accent-800)' : 'var(--color-neutral-800)', fontWeight: st.view === 'moderation' ? 600 : 400, whiteSpace: 'nowrap' }}
              >
                <span style={{ flex: 1 }}>⚑ ศูนย์ผู้ดูแล</span>
                {openReportCount > 0 && (
                  <span style={{ minWidth: 20, height: 20, padding: '0 6px', display: 'grid', placeItems: 'center', borderRadius: 999, background: 'var(--pri)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{openReportCount}</span>
                )}
              </button>
            )}
          </nav>

          <div style={wide
            ? { background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 16, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3 }
            : { display: 'flex', flexDirection: 'row', gap: 6, flex: '1 1 240px', minWidth: 0, overflowX: 'auto', padding: '2px 0', alignItems: 'center' }}
          >
            {wide && <span style={{ fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', padding: '0 6px 7px' }}>หมวดหมู่</span>}
            {st.CATS.map((c) => {
              const on = st.cat === c.name;
              return (
                <button
                  key={c.name}
                  className="hov-bg"
                  title={`Priority ${c.pri}`}
                  onClick={() => set({ cat: on ? null : c.name, activeId: null })}
                  style={wide
                    ? { cursor: 'pointer', border: 0, display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-body)', fontSize: 12.5, padding: '7px 8px', borderRadius: 9, background: on ? 'var(--color-accent-100)' : 'transparent', color: 'var(--color-neutral-800)' }
                    : { cursor: 'pointer', flex: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 12, padding: '7px 12px', borderRadius: 999, border: `1px solid ${on ? 'transparent' : 'var(--color-divider)'}`, background: on ? 'var(--color-accent-200)' : 'var(--color-surface)', color: 'var(--color-neutral-800)' }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 999, flex: 'none', background: c.dot }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>{c.name}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--color-accent-700)' }}>{st.interests.includes(c.name) ? '★' : ''}</span>
                </button>
              );
            })}
            {st.cat && (
              <button
                className="btn btn-ghost"
                onClick={() => toggleInterest(st.cat!)}
                style={{ fontSize: 11.5, color: 'var(--color-accent-700)', justifyContent: 'flex-start', padding: '7px 8px', marginTop: 4 }}
              >
                {st.interests.includes(st.cat) ? 'ลบหมวดนี้จากความสนใจ' : 'บันทึกหมวดนี้เป็นความสนใจ'}
              </button>
            )}
          </div>
        </aside>

        {st.view === 'moderation' && isMod ? (
          <main style={{ minWidth: 0, gridColumn: wide ? '2 / -1' : 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: '1 1 auto' }}>ศูนย์ผู้ดูแล</h3>
              <div className="mod-tabs" role="tablist" aria-label="ส่วนของศูนย์ผู้ดูแล" style={{ flex: 'none', maxWidth: '100%', overflowX: 'auto' }}>
                {([['reports', 'รายงาน'], ['categories', 'หมวดหมู่'], ['roles', 'ผู้ใช้และสิทธิ์']] as const).map(([k, l]) => (
                  <button key={k} role="tab" aria-selected={modSection === k} onClick={() => setModSection(k)} style={{ padding: '7px 14px', flex: 'none' }}>
                    {l}{k === 'reports' && openReportCount > 0 && <span className="mod-count">{openReportCount}</span>}
                  </button>
                ))}
              </div>
            </div>
            {modSection === 'categories' && (
              <CategoryManager
                authHeaders={authHeaders}
                flash={flash}
                dotFor={(id) => st.CATS.find((c) => String(c.id) === id)?.dot}
                revision={st.CATS.map((c) => `${c.id}:${c.name}:${c.pri}`).join('|')}
                onChanged={loadCats}
              />
            )}
            {modSection === 'roles' && <RoleManager authHeaders={authHeaders} flash={flash} myId={user?.id ?? null} revision={rolesRev} />}
            {modSection === 'reports' && <ModerationCenter
              reports={st.modReports}
              compact={st.w < 880}
              blocked={locked}
              ensurePost={ensurePost}
              renderPost={(p) => <PostCard {...cardProps(p)} />}
              timeAgo={getTimeAgo}
              onDismiss={(id) => setStatus(id, 'Dismissed')}
              onEdit={openEdit}
              onHide={(id) => set({ hideFor: id })}
              onUnhide={unhidePost}
              onReopen={(id) => setStatus(id, 'Open')}
              onRefresh={() => { refreshReports(); flash('โหลดรายงานล่าสุดแล้ว'); }}
            />}
          </main>
        ) : (<>
        {/* ── Center: feed ── */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {roleBanner && (
            <div style={{ padding: '10px 15px', borderRadius: 12, fontSize: 12.5, lineHeight: 1.5, background: 'var(--color-neutral-200)', color: 'var(--color-neutral-900)' }}>{roleBanner}</div>
          )}

          {!isGuest && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 16, padding: '12px 14px' }}>
              <span style={meAvatar}>{meInitials}</span>
              <button className="hov-bg" onClick={openCompose} style={{ flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer', border: 0, background: 'var(--color-neutral-100)', borderRadius: 999, padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-neutral-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                แบ่งปันเรื่องราวกับชุมชน มช. …
              </button>
              <button className="btn btn-primary" onClick={openCompose} style={{ flex: 'none', padding: '8px 20px', fontSize: 13 }}>โพสต์</button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '0 2px' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
              {st.view === 'announce' ? 'ประกาศทั้งหมด' : st.view === 'interests' ? 'จากหมวดที่ฉันสนใจ' : 'ฟีดรวม'}
            </h3>
            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>
              {st.view === 'announce' ? 'โพสต์จากหน่วยงานและบุคลากร' : st.view === 'interests' ? 'ตามหมวดที่คุณบันทึกไว้' : 'ประกาศขึ้นก่อน แล้วตามด้วยโพสต์ทั่วไป'}
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', marginLeft: 'auto' }}>{visible.length} โพสต์</span>
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: laneMode === 'two' ? 'repeat(auto-fit,minmax(min(100%,320px),1fr))' : '1fr', alignItems: 'start' }}>
            {feed.map((p) => <PostCard key={p.id} {...cardProps(p)} />)}
          </div>

          {feed.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', padding: '26px 4px', margin: 0, textAlign: 'center' }}>ไม่มีโพสต์ที่ตรงกับตัวกรองนี้</p>
          )}
        </main>

        {/* ── Right rail ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12, position: wide ? 'sticky' : 'static', top: 84, minWidth: 0 }}>
          <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>ประกาศ</h5>
              <span style={{ fontSize: 11, color: 'var(--color-neutral-600)', lineHeight: 1.45 }}>ประกาศที่ถูกตรึง และประกาศจากบุคลากรที่มีการตอบรับสูงใน 24 ชั่วโมง</span>
            </div>
            {railAnnounce.map((p) => (
              <button key={p.id} className="hov-border" onClick={() => openPost(p.id)} style={{ cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: 5, padding: '10px 11px', borderRadius: 12, background: 'var(--color-neutral-100)', border: '1px solid var(--color-divider)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span className="tag" style={p.priority === 'urgent'
                    ? { background: '#f2c6b6', color: '#6f2f14', fontSize: 10, fontWeight: 700 }
                    : { background: 'var(--peach)', color: 'var(--color-accent-800)', fontSize: 10, fontWeight: 700 }}
                  >
                    {p.priority === 'urgent' ? 'ประกาศด่วน' : 'ประกาศ'}
                  </span>
                  <span style={{ fontSize: 10.5, color: 'var(--color-neutral-700)' }}>{likeCount(p).toLocaleString()} ถูกใจ</span>
                </span>
                <span style={{ fontSize: 12.5, lineHeight: 1.4, display: 'block', fontWeight: 600 }}>{p.title}</span>
                <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>{p.name}</span>
              </button>
            ))}
          </section>

          {isMod && (
            <section style={{ background: 'var(--peach)', border: '1px solid var(--color-accent-300)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>งานของผู้ดูแล</h5>
                <span style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', lineHeight: 1.45 }}>
                  {openReportCount ? `มี ${openReportCount} โพสต์รอตรวจ` : 'ไม่มีรายงานค้าง'}
                </span>
              </div>
              <div style={{ display: 'grid', gap: 7, gridTemplateColumns: 'repeat(3,1fr)' }}>
                {STATUSES.map((k) => {
                  const [bg, fg] = statusLook(k);
                  return (
                    <div key={k} style={{ background: bg, color: fg, borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{st.modReports.filter((r) => r.tickets.length && r.status === k).length}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-neutral-700)', lineHeight: 1.25 }}>{REPORT_LABEL[k]}</span>
                    </div>
                  );
                })}
              </div>
              <button className="btn btn-primary" onClick={() => set({ view: 'moderation', activeId: null })} style={{ fontFamily: 'var(--font-body)', fontSize: 13, width: '100%' }}>
                เปิดศูนย์ผู้ดูแล →
              </button>
            </section>
          )}
        </aside>
        </>)}
      </div>

      {active && (
        <PostModal
          st={st}
          set={set}
          active={active}
          card={cardProps(active)}
          isGuest={isGuest}
          isMod={isMod}
          meName={meName}
          meInitials={meInitials}
          meAvatar={meAvatar}
          gate={gate}
          flash={flash}
          onComment={(pid, text) => postComment(pid, text)}
          onReply={(pid, parentId, text) => postComment(pid, text, parentId)}
          onReactComment={reactToComment}
          onClose={goHome}
        />
      )}

      {st.composeOpen && (
        <ComposeDialog
          st={st}
          set={set}
          isMod={isMod}
          meName={meName}
          meInitials={meInitials}
          meAvatar={meAvatar}
          flash={flash}
          nextPostId={() => `p-new-${++ids.current.post}`}
          nextMediaId={() => `m${++ids.current.media}`}
          onPosted={() => { loadPosts(); loadAnnouncements(); }}
        />
      )}

      {st.editFor && <EditDialog st={st} set={set} flash={flash} setStatus={setStatus} isMod={isMod} onHide={(id) => set({ editFor: null, hideFor: id })} onUnhide={unhidePost} onDelete={(id) => set({ editFor: null, deleteFor: id })} />}
      {st.deleteFor && <DeleteDialog st={st} set={set} isMod={isMod} onDelete={deletePost} />}
      {st.hideFor && <HideDialog st={st} set={set} onHide={hidePost} />}

      {st.reportFor && <ReportDialog st={st} set={set} flash={flash} onSubmit={submitReport} />}
      {st.login && <LoginDialog initialMode={st.login} onClose={closeLogin} onDone={onLoginDone} />}

      {st.toast && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 24, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ background: 'var(--color-accent-800)', color: '#fdf8f1', padding: '11px 20px', borderRadius: 999, boxShadow: 'var(--shadow-lg)', fontSize: 13, animation: 'wnm-rise .2s ease both', maxWidth: '90vw', textAlign: 'center' }}>
            {st.toast}
          </div>
        </div>
      )}
    </div>
  );
}
