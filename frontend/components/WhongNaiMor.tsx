'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CATS, COMMENTS, ME, POSTS, QA, STATUSES,
  catDots, updateCommentLikesById,
  type Comment, type Post, type ReactionType, type ReportStatus,
} from '@/lib/data';
import { ACCENT_MAP, avatarStyle, likeCount, statusLook } from '@/lib/ui';
import { useAuthContext } from './AuthContext';
import { supabase } from '@/lib/dbauth';
import PostCard from './PostCard';
import PostModal from './PostModal';
import { ComposeDialog, EditDialog, ReportDialog } from './Dialogs';

export type ViewerRole = 'student' | 'moderator' | 'guest';
type View = 'home' | 'announce' | 'interests' | 'questions';

/** A file picked in the composer; `url` is an object URL used only for the preview. */
export interface NewMedia { id: string; type: 'image' | 'video'; label: string; file: File; url: string }

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
  reportStatus: Record<string, ReportStatus>;   // keyed by post id
  reportReason: Record<string, string>;         // keyed by post id
  reportId: Record<string, string>;             // post id -> reports.id
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
  editTitle: string;
  editBody: string;
  editCats: string[];
  editImportant: boolean;
  notifOpen: boolean;
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
  likes: {}, cLikes: {}, comments: {}, posts: [], announce: [], extraPosts: [], notifs: [], interests: ['เรียน / Academics'],
  reportStatus: {},
  reportReason: {},
  reportId: {},
  draft: '', composerOpen: false, replyTo: null, replyDraft: '', openReplies: {}, shown: 12,
  composeOpen: false, newTitle: '', newText: '', newCats: [], newMedia: [], newImportant: false,
  reportFor: null, reason: null,
  editFor: null, editTitle: '', editBody: '', editCats: [], editImportant: false,
  notifOpen: false, toast: null,
  CATS: CATS,
  w: 1280,
};

interface Props {
  accentColor?: string;
  viewerRole?: ViewerRole;
  laneMode?: 'single' | 'two';
}

const API_URL = "http://localhost:3030";

export default function WhongNaiMor({ accentColor = '#7d50a8', viewerRole, laneMode = 'single' }: Props) {
  const [st, setRaw] = useState<AppState>(INITIAL);
  const set: SetState = useCallback((patch) => {
    setRaw((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ids = useRef({ comment: 0, post: 0, media: 0 });

  // Needed to sign the comment / reply / reaction writes; reads stay public,
  // but a signed-in reader also gets my_reaction back on the fetch routes.
  const { user, session } = useAuthContext();

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

  useEffect(() => {
    if (!user?.id) { setMe(null); setRoleLoaded(true); return; }
    let cancelled = false;
    (async () => {
      const res = await fetch(`${API_URL}/user/current/fetch`, { headers: authHeaders({ "Content-Type": "application/json" }) });
      console.log(res.status);

      if (cancelled) return;
      if (!res.ok) {
        const errorBody = await res.json();
        console.error('load viewer', res.status, errorBody);
        setMe(null);
        setRoleLoaded(true);
        return;
      }
      const data = await res.json();
      setMe({ display_name: data.display_name, is_mod: !!data.is_mod });
      setRoleLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // The prop still wins, so a role can be forced while demoing.
  const role: ViewerRole = viewerRole ?? (me ? (me.is_mod ? 'moderator' : 'student') : 'guest');
  const isGuest = role === 'guest';
  const isMod = role === 'moderator';

  const flash = useCallback((t: string) => {
    set({ toast: t });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => set({ toast: null }), 2400);
  }, [set]);
  const gate = () => flash('ผู้ใช้ภายนอกอ่านได้เท่านั้น · ต้องเข้าสู่ระบบด้วยบัญชี @cmu.ac.th');

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

  // preload categories
  useEffect(() => {
    (async () => {
      const newCatsRes = await fetch(`${API_URL}/misc/categories`);
      const newCats = await newCatsRes.json();
      
      const dots = catDots(newCats.map((c: any) => String(c.id)));
      setRaw((prev) => ({ ...prev, CATS: newCats.map((c: any) => ({ id: c.id, name: c.category_name, pri: c.priority, dot: dots[c.id] })) }));
    })()
  }, [])

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
  });

  // Load post (comment count doesn't show)
  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/post/fetch`, { headers: authHeaders() });
      const ps = await res.json();
      if (!Array.isArray(ps)) throw new Error(ps?.message ?? 'bad /post/fetch payload');
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
  useEffect(() => {
    fetch(`${API_URL}/post/fetch/announcement`).then(async (res) => {
      if (!res.ok) return;
      const ps = await res.json();
      set({ announce: ps.map(toFrontendPost) });
    }).catch((err) => console.error(err));
  }, [])

  // Load notifications of the signed in user (from the notifications table)
  useEffect(() => {
    if (!session?.access_token) {
      set({ notifs: [] });
      return;
    }
    fetch(`${API_URL}/notification/fetch/`, {
      headers: authHeaders(),
    }).then(async (res) => {
      if (!res.ok) return;
      set({ notifs: await res.json() });
    }).catch((err) => console.error(err));
  }, [session?.access_token])

  // load comment per post
  const loadComments = useCallback(async (posts: Post[]) => {
      // Signed in, the API tags each row with my_reaction; signed out it sends null.
      const cress = await Promise.all(posts.map((p) => fetch(`${API_URL}/comment/fetch/${p.id}`, { headers: authHeaders() })))
      let fetchedComments = await Promise.all(cress.map((c) => c.json()))
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
      set({ comments: postComments, cLikes: mineC });
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
      await loadComments(loadedPosts);
      return true;
    } catch (err) {
      console.error('postComment', err);
      return false;
    }
  }, [session, loadComments, loadedPosts]);

  /**
   * Load the moderation queue, for moderators only.
   *
   * Read straight from the reports table rather than through /report/fetch,
   * which gates on getUserData() and so hits the same broken `uid` filter.
   * A post can hold several tickets; the newest one represents it in the queue.
   */
  const loadReports = useCallback(async () => {
    if (!isMod) return;

    const res = await fetch(`${API_URL}/report/fetch`, { 
      method: 'GET',
      headers: authHeaders({"Content-Type": "application/json"})
    });
    // console.log(res.status);
    // console.log(await res.json());

    // don't use supabase here
    // const { data, error } = await supabase
    //   .from('reports')
    //   .select('id, post_id, reason, status, created_at')
    //   .order('created_at', { ascending: true });
    // if (error) return console.error('loadReports', error);
    if (!res.ok) {
      const errorBody = await res.json();
      console.error('loadReports', res.status, errorBody);
      return;
    }
    const data = await res.json();

    const status: Record<string, ReportStatus> = {};
    const reason: Record<string, string> = {};
    const rid: Record<string, string> = {};
    (data ?? []).forEach((r: any) => {
      status[r.post_id] = r.status;
      reason[r.post_id] = r.reason;
      rid[r.post_id] = r.id;
    });
    set({ reportStatus: status, reportReason: reason, reportId: rid });
  }, [isMod, set]);

  useEffect(() => { loadReports(); }, [loadReports]);

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
  const locked = !!(st.activeId || st.composeOpen || st.editFor || st.reportFor);
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
  const openPost = async (id: string) => {
    if (!findPost(id)) {
      // post is not in the feed or announcements (e.g. from a notification), so load it by itself
      const res = await fetch(`${API_URL}/post/${id}/fetch`);
      if (!res.ok) return flash('ไม่พบโพสต์นี้แล้ว');
      const p = toFrontendPost(await res.json());
      set((prev) => ({ extraPosts: [...prev.extraPosts, p] }));
    }
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

  /**
   * `id` is the post id; the ticket it maps to is what gets updated.
   *
   * Heads up: this write currently fails for everyone with
   *   42703 record "new" has no field "reviewed_by"
   * A trigger on `reports` reads NEW.reviewed_by, but the table only has
   * reviewed_at. It is a database-side fix, so until it lands the UI rolls the
   * chip back and says so rather than pretending the change stuck.
   */
  const setStatus = async (id: string, next: ReportStatus) => {
    const rid = st.reportId[id];
    if (!rid) return flash('ไม่พบตั๋วรายงานของโพสต์นี้');

    const before = st.reportStatus[id];
    set((prev) => ({ reportStatus: { ...prev.reportStatus, [id]: next } }));

    // const { error } = await supabase
    //   .from('reports')
    //   .update({ status: next, reviewed_at: new Date().toISOString() })
    //   .eq('id', rid);
    const res = await fetch(`${API_URL}/report/update/${rid}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status: next }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('setStatus', error);
      set((prev) => ({ reportStatus: { ...prev.reportStatus, [id]: before } }));
      flash(error.code === '42703'
        ? 'เปลี่ยนสถานะไม่ได้ · ติดที่ trigger ฝั่ง DB (reviewed_by)'
        : 'เปลี่ยนสถานะไม่สำเร็จ');
      return;
    }
    flash(`เปลี่ยนสถานะรายงานเป็น ${next}`);
  };

  const openEdit = (id: string) => {
    const p = st.posts.find((x) => x.id === id);
    if (!p) return;
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
    console.log(before, next, change, (before && !!next) && change);
    // return;

    // set((prev) => ({ likes: withReaction(prev.likes, pid, next) }));
    try {
      const newLikeCount = await react('post', pid, type, (before && !!next) && change);
      set((prev) => ({ ...prev, likes: withReaction(prev.likes, pid, next), posts: prev.posts.map((p) => p.id === pid ? { ...p, likes: newLikeCount } : p) }));
      // await loadPosts();                       // counts come back from the server (slow don't do it)
    } catch (err: any) {
      console.error('reactToPost', err);
      set((prev) => ({ likes: withReaction(prev.likes, pid, before) }));
      flash(err.message);
    }
  }, [react, loadPosts, set, flash, st.likes]);

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
    onEdit: () => openEdit(p.id),
    onReport: () => (isGuest ? gate() : set({ reportFor: p.id, reason: null })),
    onSetStatus: (s: ReportStatus) => setStatus(p.id, s),
  });

  const railAnnounce = [...st.announce]
    .sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0) || b.likes - a.likes)
    .slice(0, 4);

  // Real display_name once it loads; ME is only the fallback in between.
  const meName = isGuest ? 'ผู้เยี่ยมชม' : (me?.display_name ?? ME.name);
  const meInitials = isGuest ? 'G' : meName.slice(0, 2);
  const meAvatar = avatarStyle(isGuest ? 3 : ME.tint, 34);

  const roleBanner = isMod
    ? 'โหมดผู้ดูแล · แตะชิปสถานะบนโพสต์ที่ถูกรายงานเพื่อเปลี่ยน Open → Reviewed → Dismissed'
    : isGuest ? 'กำลังดูในฐานะผู้ใช้ภายนอก (Non-CMU) · อ่านได้เท่านั้น' : '';

  const openCompose = () => (isGuest ? gate() : set({ composeOpen: true, notifOpen: false }));
  const goHome = () => set({ activeId: null, replyTo: null, notifOpen: false });

  const active = findPost(st.activeId);

  const modQueue = Object.keys(st.reportStatus)
    .map((id) => ({ id, post: st.posts.find((p) => p.id === id), status: st.reportStatus[id] }))
    .filter((r): r is { id: string; post: Post; status: ReportStatus } => !!r.post)
    .sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status));

  const shellCols = st.w >= 1060 ? '212px minmax(0,1fr) 292px' : wide ? '176px minmax(0,1fr) 224px' : 'minmax(0,1fr)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 60 }}>
      {/* ── Top bar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '11px clamp(14px,2.5vw,26px)', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}>
        <div onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <span style={{ width: 26, height: 26, flex: 'none', display: 'grid', placeItems: 'center', borderRadius: 999, background: 'var(--color-accent)', color: '#fff', fontSize: 13, fontWeight: 700 }}>ว</span>
          <span style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.01em' }}>WhongNaiMor</span>
        </div>

        <input
          className="input"
          value={st.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="ค้นหาโพสต์ หมวดหมู่ หรือผู้ใช้ · search posts, categories"
          style={{ flex: '1 1 200px', maxWidth: 420, margin: '0 auto', background: 'var(--color-surface)', fontSize: 13, padding: '9px 16px' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <button className="btn btn-ghost" onClick={() => set({ notifOpen: !st.notifOpen })} style={{ fontSize: 13, color: 'var(--color-neutral-800)', padding: '6px 8px' }}>
            การแจ้งเตือน
            {unreadNotifs > 0 && (
              <span style={{ minWidth: 17, height: 17, padding: '0 5px', display: 'grid', placeItems: 'center', borderRadius: 999, background: 'var(--pri)', color: '#fff', fontSize: 10, fontWeight: 700 }}>{unreadNotifs}</span>
            )}
          </button>
          <span style={meAvatar}>{meInitials}</span>

          {st.notifOpen && (
            <div style={{ position: 'absolute', right: 0, top: 44, width: 'min(340px,82vw)', background: 'var(--color-surface)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-divider)', padding: 12, display: 'flex', flexDirection: 'column', gap: 2, animation: 'wnm-pop .16s ease both' }}>
              <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', padding: '2px 6px 8px' }}>แจ้งเตือนจากโพสต์ประกาศ</span>
              {st.notifs.length === 0 && (
                <span style={{ fontSize: 13, color: 'var(--color-neutral-600)', padding: '9px 10px' }}>ยังไม่มีการแจ้งเตือน</span>
              )}
              {st.notifs.map((n) => (
                <button key={n.id} className="hov-bg" onClick={() => openNotif(n)} style={{ cursor: 'pointer', textAlign: 'left', border: 0, background: 'transparent', borderRadius: 12, padding: '9px 10px', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
                  <span style={{ fontSize: 13, lineHeight: 1.45, display: 'block' }}>{n.message}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>{getTimeAgo(n.created_at)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1220, margin: '0 auto', padding: 'clamp(14px,2vw,22px) clamp(12px,2.5vw,26px)', display: 'grid', gap: 'clamp(12px,1.6vw,20px)', gridTemplateColumns: shellCols, alignItems: 'start' }}>
        {/* ── Left: views + categories ── */}
        <aside style={{ display: 'flex', gap: wide ? 14 : 8, flexDirection: wide ? 'column' : 'row', flexWrap: 'wrap', position: wide ? 'sticky' : 'static', top: 76, minWidth: 0 }}>
          <nav style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: wide ? 16 : 999, padding: wide ? 8 : '5px 6px', display: 'flex', flexDirection: wide ? 'column' : 'row', gap: wide ? 2 : 4, flex: 'none' }}>
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
                onClick={() => {
                  if (isGuest) return gate();
                  const has = st.interests.includes(st.cat!);
                  set((prev) => ({ interests: has ? prev.interests.filter((x) => x !== prev.cat) : [...prev.interests, prev.cat!] }));
                  flash(has ? 'ลบออกจากความสนใจแล้ว' : 'บันทึกเป็นความสนใจแล้ว · จะได้รับแจ้งเตือนประกาศในหมวดนี้');
                }}
                style={{ fontSize: 11.5, color: 'var(--color-accent-700)', justifyContent: 'flex-start', padding: '7px 8px', marginTop: 4 }}
              >
                {st.interests.includes(st.cat) ? 'ลบหมวดนี้จากความสนใจ' : 'บันทึกหมวดนี้เป็นความสนใจ'}
              </button>
            )}
          </div>
        </aside>

        {/* ── Center: feed ── */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {roleBanner && (
            <div style={{ padding: '10px 15px', borderRadius: 12, fontSize: 12.5, lineHeight: 1.5, background: isMod ? '#e9f0dc' : 'var(--color-neutral-200)', color: 'var(--color-neutral-900)' }}>{roleBanner}</div>
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
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12, position: wide ? 'sticky' : 'static', top: 76, minWidth: 0 }}>
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
            <section style={{ background: 'var(--peach)', border: '1px solid var(--color-accent-300)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>งานของผู้ดูแล</h5>
                <span style={{ fontSize: 11, color: 'var(--color-neutral-700)', lineHeight: 1.45 }}>คิวรายงานที่ยังไม่ปิด และโพสต์ที่แก้ไขล่าสุด</span>
              </div>

              <div style={{ display: 'grid', gap: 7, gridTemplateColumns: 'repeat(3,1fr)' }}>
                {([['Open', 'รอตรวจสอบ'], ['Reviewed', 'ตรวจแล้ว'], ['Dismissed', 'ยกคำร้อง']] as const).map(([k, label]) => {
                  const [bg, fg] = statusLook(k);
                  return (
                    <div key={k} style={{ background: bg, color: fg, borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{Object.values(st.reportStatus).filter((v) => v === k).length}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-neutral-700)', lineHeight: 1.25 }}>{label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>คิวรายงาน</span>
                {modQueue.map((r) => {
                  const [bg, fg] = statusLook(r.status);
                  const actions = [
                    { label: 'แก้ไขโพสต์', onClick: () => openEdit(r.id) },
                    ...STATUSES.filter((x) => x !== r.status).map((x) => ({ label: x, onClick: () => setStatus(r.id, x) })),
                  ];
                  return (
                    <div key={r.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 12, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <button className="hov-color" onClick={() => openPost(r.id)} style={{ cursor: 'pointer', border: 0, background: 'transparent', padding: 0, textAlign: 'left', fontFamily: 'var(--font-body)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span className="tag" style={{ background: bg, color: fg, fontSize: 10, fontWeight: 700 }}>{r.status}</span>
                          <span style={{ fontSize: 10.5, color: 'var(--color-neutral-700)' }}>{r.post.reports || 1} รายงาน</span>
                        </span>
                        <span style={{ fontSize: 12, lineHeight: 1.4, fontWeight: 600 }}>{r.post.title}</span>
                        <span style={{ fontSize: 10.5, color: 'var(--color-neutral-700)' }}>
                          {st.reportReason[r.id] ? `เหตุผล: ${st.reportReason[r.id]}` : 'ไม่ระบุเหตุผล'}
                        </span>
                      </button>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {actions.map((a) => (
                          <button key={a.label} className="hov-border" onClick={a.onClick} style={{ cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 10.5, padding: '5px 11px', borderRadius: 999, border: '1px solid var(--color-divider)', background: 'var(--color-neutral-100)', color: 'var(--color-neutral-800)' }}>
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {modQueue.length === 0 && (
                  <p style={{ margin: 0, fontSize: 11.5, color: 'var(--color-neutral-700)', padding: '6px 2px' }}>ไม่มีรายงานที่ยังไม่ปิด</p>
                )}
              </div>
            </section>
          )}
        </aside>
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
        />
      )}

      {st.editFor && <EditDialog st={st} set={set} flash={flash} setStatus={setStatus} />}

      {st.reportFor && <ReportDialog st={st} set={set} flash={flash} />}

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
