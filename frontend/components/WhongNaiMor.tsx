'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { QA, type Post, type ReactionType, type ReportStatus } from '@/lib/data';
import { toPost } from '@/lib/mappers';
import { INITIAL, findPostIn, mapAllPosts, postLists, type AppState, type Notif, type SetState, type ViewerRole } from '@/lib/state';
import { ACCENT_MAP, avatarStyle } from '@/lib/ui';
import { useFeedData } from '@/hooks/useFeedData';
import { useLiveUpdates } from '@/hooks/useLiveUpdates';
import { usePostUrl } from '@/hooks/usePostUrl';
import { useToast } from '@/hooks/useToast';
import { useUndoableWrites } from '@/hooks/useUndoableWrites';
import { useViewer } from '@/hooks/useViewer';
import { useApi, useAuthContext } from './AuthContext';
import { AccountMenu } from './AccountMenu';
import { BottomNav } from './BottomNav';
import { CategoryManager } from './CategoryManager';
import { ComposeDialog } from './ComposeDialog';
import { EditDialog } from './EditDialog';
import { Feed } from './Feed';
import { ImageViewer } from './ImageViewer';
import { InterestsDialog } from './InterestsDialog';
import { LoginDialog } from './LoginDialog';
import { ModerationCenter } from './ModerationCenter';
import { ModerationHistory } from './ModerationHistory';
import { ModerationView } from './ModerationView';
import PostCard from './PostCard';
import { DeleteDialog, HideDialog } from './PostActionDialogs';
import PostModal from './PostModal';
import { ProfileView } from './ProfileView';
import { ReportDialog } from './ReportDialog';
import { RightRail } from './RightRail';
import { RoleManager } from './RoleManager';
import { Sidebar } from './Sidebar';
import { Toast } from './Toast';
import { TopBar } from './TopBar';

interface Props {
  accentColor?: string;
  viewerRole?: ViewerRole;   // forces a role while demoing; otherwise it comes from users.is_mod
  laneMode?: 'single' | 'two';
}

const UNDO_MS = 5000;

const STATUS_TOAST: Record<ReportStatus, string> = {
  Open: 'ส่งกลับไปรอตรวจแล้ว',
  Reviewed: 'จัดการแล้ว · แจ้งผลให้ผู้รายงานแล้ว',
  Dismissed: 'ไม่พบปัญหา · แจ้งผลให้ผู้รายงานแล้ว',
};

/** Drop the key entirely when the reaction is cleared, so lookups stay falsy. */
const withReaction = (map: Record<string, ReactionType>, id: string, next?: ReactionType) => {
  const copy = { ...map };
  if (next) copy[id] = next; else delete copy[id];
  return copy;
};

export default function WhongNaiMor({ accentColor = '#7d50a8', viewerRole, laneMode = 'single' }: Props) {
  const [st, setRaw] = useState<AppState>(INITIAL);
  const set: SetState = useCallback((patch) => {
    setRaw((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const api = useApi();
  const { signOut } = useAuthContext();
  const { toast, flash, runAction } = useToast(UNDO_MS);
  const { defer, isPending } = useUndoableWrites(flash, UNDO_MS);
  const viewer = useViewer(flash, viewerRole);
  const { user, isGuest, isMod } = viewer;
  const [accountOpen, setAccountOpen] = useState(false);
  const [rolesRev, setRolesRev] = useState(0);
  const [liveRev, setLiveRev] = useState(0);   // bumps on live post/report changes, for lists that load themselves

  // A refresh during the undo window must not bring back a post that is about to be deleted or hidden.
  const hiddenLocally = useCallback((id: string) => isPending(`delete:${id}`) || isPending(`hide:${id}`), [isPending]);
  const data = useFeedData(set, { signedIn: !!user, isMod, hiddenLocally });
  const { loadPosts, loadAnnouncements, loadComments, refreshReports, loadMine, search } = data;
  const searchMode = !!st.q.trim();

  // Search the server once typing pauses.
  useEffect(() => {
    const t = setTimeout(() => search(st.q), 300);
    return () => clearTimeout(t);
  }, [st.q, search]);

  // A guest trying to write gets the login window instead of a dead end.
  const gate = () => set({ login: 'login', notifOpen: false });

  /* ── Followed categories ── */

  useEffect(() => { if (st.interestsOpen && !data.interestsLoaded) data.loadInterests(); }, [st.interestsOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Replace the followed categories with `names`; false if the API refused. */
  const putInterests = async (names: string[]) => {
    const category_ids = names.map((n) => st.cats.find((c) => c.name === n)?.id).filter(Boolean);
    const res = await api('/user/interests', { method: 'PUT', json: { category_ids } }).catch(() => null);
    return !!res?.ok;
  };

  const saveInterests = async (names: string[]) => {
    if (!(await putInterests(names))) { flash('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'); return false; }
    set({ interests: names });
    flash(names.length ? `ติดตาม ${names.length} หมวดแล้ว · จะได้รับแจ้งเตือนประกาศในหมวดเหล่านี้` : 'เลิกติดตามทุกหมวดแล้ว');
    return true;
  };

  const toggleInterest = async (name: string) => {
    if (isGuest) return gate();
    // Saving replaces the whole list, so it must start from what the server has.
    if (!data.interestsLoaded) { data.loadInterests(); return flash('กำลังโหลดหมวดที่ติดตาม ลองอีกครั้งในอีกสักครู่'); }
    const before = st.interests;
    const has = before.includes(name);
    const next = has ? before.filter((x) => x !== name) : [...before, name];
    set({ interests: next });
    if (!(await putInterests(next))) {
      set({ interests: before });
      return flash('บันทึกความสนใจไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    flash(has ? 'ลบออกจากความสนใจแล้ว' : 'บันทึกเป็นความสนใจแล้ว · จะได้รับแจ้งเตือนประกาศในหมวดนี้');
  };

  /* ── Posts and comments ── */

  // Every loaded post: the feed, the announcement rail and posts opened from a link or notification.
  const loadedPosts = useMemo(() => {
    const all = [...st.posts, ...st.announce, ...st.extraPosts, ...(st.results ?? []), ...(st.mine ?? [])];
    return all.filter((p, i) => all.findIndex((x) => x.id === p.id) === i);
  }, [st.posts, st.announce, st.extraPosts, st.results, st.mine]);

  useEffect(() => { loadComments(loadedPosts); }, [loadedPosts, loadComments]);

  const findPost = (id: string | null) => findPostIn(st, id);

  /** The post, loading it by itself when it is not in the feed or announcements. */
  const ensurePost = async (id: string): Promise<Post | null> => {
    const found = findPost(id);
    if (found) return found;
    const res = await api(`/post/${id}/fetch`).catch(() => null);
    if (!res?.ok) return null;
    const p = toPost(await res.json());
    set((prev) => ({ extraPosts: [...prev.extraPosts, p] }));
    return p;
  };

  const openPost = async (id: string) => {
    if (!(await ensurePost(id))) return flash('ไม่พบโพสต์นี้แล้ว');
    set({ activeId: id, notifOpen: false, replyTo: null, replyDraft: '', composerOpen: false, shown: 12 });
  };
  const closePost = () => set({ activeId: null, replyTo: null, notifOpen: false });

  usePostUrl(st.activeId, openPost, closePost);

  /**
   * Comment writes, then re-read that post's thread: the create endpoints answer with an
   * empty 200, and the row the page needs carries joined fields (display_name, role).
   */
  const writeComment = async (postId: string, path: string, opts: Parameters<typeof api>[1]) => {
    const res = await api(path, opts).catch(() => null);
    if (!res?.ok) return false;
    await loadComments([{ id: postId }]);
    return true;
  };
  const postComment = (postId: string, text: string, parentId?: string) =>
    writeComment(postId, parentId ? `/comment/${postId}/replyto/${parentId}` : `/comment/${postId}`, { method: 'POST', json: { content: text } });
  const editComment = (postId: string, commentId: string, text: string) =>
    writeComment(postId, `/comment/${commentId}`, { method: 'PUT', json: { content: text } });
  const deleteComment = (postId: string, commentId: string) =>
    writeComment(postId, `/comment/${commentId}`, { method: 'DELETE' });

  /** Toggle this viewer's reaction; the API flips it and answers with the new total. */
  const react = async (kind: 'post' | 'comment', id: string, type: ReactionType, change: boolean): Promise<number> => {
    const res = await api(`/${kind}/${id}/react`, { method: 'POST', json: { reaction_type: type, change } });
    if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? `HTTP ${res.status}`);
    return res.json();
  };

  const reactToPost = async (pid: string, type: ReactionType, change: boolean) => {
    const before = st.likes[pid];
    // Tapping the one already held clears it — same rule the endpoint applies.
    const next = before === type ? undefined : type;
    // Show the result right away; the server's count replaces it after.
    const delta = before && !next ? -1 : !before && next ? 1 : 0;
    const setCount = (count: (p: Post) => number) => set((prev) => mapAllPosts(prev, (list) =>
      list.map((p) => (p.id === pid ? { ...p, likes: Math.max(0, count(p)) } : p))));
    set((prev) => ({ likes: withReaction(prev.likes, pid, next) }));
    setCount((p) => p.likes + delta);
    try {
      const total = await react('post', pid, type, !!before && !!next && change);
      setCount(() => total);
    } catch (err: any) {
      console.error('reactToPost', err);
      set((prev) => ({ likes: withReaction(prev.likes, pid, before) }));
      setCount((p) => p.likes - delta);
      flash('รีแอคไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  const reactToComment = async (pid: string, cid: string, type: ReactionType, change: boolean) => {
    const before = st.cLikes[cid];
    const next = before === type ? undefined : type;
    try {
      const total = await react('comment', cid, type, !!before && !!next && change);
      set((prev) => ({
        cLikes: withReaction(prev.cLikes, cid, next),
        comments: {
          ...prev.comments,
          [pid]: (prev.comments[pid] ?? []).map((c) => c.id === cid
            ? { ...c, likes: total }
            : { ...c, replies: c.replies.map((r) => (r.id === cid ? { ...r, likes: total } : r)) }),
        },
      }));
    } catch (err: any) {
      console.error('reactToComment', err);
      flash('รีแอคไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  /* ── Notifications ── */

  const openNotif = (n: Notif) => {
    if (!n.is_read && user) {
      set((prev) => ({ notifs: prev.notifs.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)) }));
      api(`/notification/${n.id}/read`, { method: 'POST' }).catch((err) => console.error(err));
    }
    openPost(n.post_id);
  };

  /** Mark every notification read: the badge clears at once, and comes back if the API refuses. */
  const readAllNotifs = async () => {
    const before = st.notifs;
    set({ notifs: before.map((n) => ({ ...n, is_read: true })) });
    const res = await api('/notification/read-all', { method: 'POST' }).catch(() => null);
    if (!res?.ok) {
      set({ notifs: before });
      return flash('อ่านทั้งหมดไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    flash('อ่านการแจ้งเตือนทั้งหมดแล้ว');
  };

  const unreadNotifs = st.notifs.filter((n) => !n.is_read).length;

  /* ── Reports and moderation ── */

  /** Send a report; resolves to an error message, or null on success. */
  const submitReport = async (postId: string, reason: string) => {
    const res = await api('/report/createticket', { method: 'POST', json: { post_id: postId, reason } }).catch(() => null);
    if (res?.status === 409) {
      await refreshReports();
      return 'คุณรายงานโพสต์นี้ไปแล้ว · รอผู้ดูแลตรวจสอบ';
    }
    if (!res?.ok) {
      console.error('submitReport', res?.status);
      return 'ส่งรายงานไม่สำเร็จ ลองใหม่อีกครั้ง';
    }
    await refreshReports();
    return null;
  };

  /** An undoable request that throws when the API refuses (see useUndoableWrites). */
  const commitTo = (path: string, method: 'PUT' | 'DELETE', json?: unknown) => async (keepalive?: boolean) => {
    const res = await api(path, { method, json, keepalive });
    if (!res.ok) throw new Error(`${method} ${path} ${res.status}`);
  };

  /** Set the report status of post `id` (all of its tickets). The reporters get a notification. */
  const setStatus = (id: string, next: ReportStatus) => {
    const before = st.reportStatus[id];
    const beforeQueue = st.modReports.find((r) => r.post_id === id)?.status;
    if ((beforeQueue ?? before) === next) return;
    // Flip the chip and the queue now, roll back each to its own old value on undo or failure.
    const apply = (chip: ReportStatus | undefined, queue: ReportStatus | undefined) => set((prev) => ({
      reportStatus: chip ? { ...prev.reportStatus, [id]: chip } : prev.reportStatus,
      modReports: prev.modReports.map((r) => (r.post_id === id && queue ? { ...r, status: queue } : r)),
    }));
    defer(`status:${id}`, {
      message: STATUS_TOAST[next],
      apply: () => apply(next, next),
      revert: () => apply(before, beforeQueue),
      commit: commitTo(`/report/post/${id}/status`, 'PUT', { status: next }),
      failMessage: 'เปลี่ยนสถานะไม่สำเร็จ',
      after: refreshReports,
    });
  };

  /** Hide a post (moderators): it leaves the feed, its open reports close as Reviewed, reporters and author are told. */
  const hidePost = async (id: string, reason: string) => {
    const snapshot = { ...postLists(st), modReports: st.modReports, reportStatus: st.reportStatus };
    const drop = (list: Post[]) => list.filter((p) => p.id !== id);
    const flag = (list: Post[]) => list.map((p) => (p.id === id ? { ...p, hidden: { reason: reason || null } } : p));
    defer(`hide:${id}`, {
      message: 'ซ่อนโพสต์แล้ว · ผู้รายงานและเจ้าของโพสต์จะได้รับแจ้ง',
      apply: () => set((prev) => ({
        hideFor: null,
        activeId: prev.activeId === id ? null : prev.activeId,
        posts: drop(prev.posts),
        announce: drop(prev.announce),
        results: prev.results && drop(prev.results),
        // Still listed where the author or a moderator looks at it, now marked hidden.
        extraPosts: flag(prev.extraPosts),
        mine: prev.mine && flag(prev.mine),
        // The API closes open reports as Reviewed; show that already.
        modReports: prev.modReports.map((r) => (r.post_id === id ? { ...r, hidden: true, hiddenReason: reason, status: r.status === 'Open' ? 'Reviewed' : r.status } : r)),
        reportStatus: prev.reportStatus[id] === 'Open' ? { ...prev.reportStatus, [id]: 'Reviewed' } : prev.reportStatus,
      })),
      revert: () => set(snapshot),
      commit: commitTo(`/post/${id}/hide`, 'PUT', { reason }),
      failMessage: 'ซ่อนโพสต์ไม่สำเร็จ',
      after: refreshReports,
    });
  };

  /** Delete a post for good: the author's own, or any post for a moderator. */
  const deletePost = async (id: string) => {
    const snapshot = postLists(st);
    defer(`delete:${id}`, {
      message: 'ลบโพสต์แล้ว',
      apply: () => set((prev) => ({
        deleteFor: null,
        activeId: prev.activeId === id ? null : prev.activeId,
        ...mapAllPosts(prev, (list) => list.filter((p) => p.id !== id)),
      })),
      revert: () => set(snapshot),
      commit: commitTo(`/post/${id}/delete`, 'DELETE'),
      failMessage: 'ลบโพสต์ไม่สำเร็จ',
      after: refreshReports,
    });
  };

  /** Show a hidden post again (moderators). */
  const unhidePost = async (id: string) => {
    const res = await api(`/post/${id}/unhide`, { method: 'PUT' }).catch(() => null);
    if (!res?.ok) {
      console.error('unhidePost', res?.status);
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

  const openReports = st.modReports.filter((r) => r.status === 'Open').length;
  useEffect(() => {
    if ((!isMod && st.view === 'moderation') || (isGuest && st.view === 'profile')) set({ view: 'home' });
  }, [isMod, isGuest, st.view, set]);
  useEffect(() => { if (st.view === 'profile') loadMine(); }, [st.view, loadMine]);

  /* ── Live updates ── */

  useLiveUpdates({
    posts: () => {
      loadPosts(); loadAnnouncements(); setLiveRev((v) => v + 1);
      if (searchMode) search(st.q, true);   // refresh in place
      if (st.mine) loadMine();
    },
    comments: (postId) => loadComments(postId ? [{ id: postId }] : loadedPosts),
    reports: () => { refreshReports(); setLiveRev((v) => v + 1); },
    notifications: () => { data.loadNotifs(); },
    categories: () => { data.loadCats(); },
    roles: () => { viewer.reload(); setRolesRev((v) => v + 1); },
  });

  /* ── Page chrome: accent colour, viewport width, Escape, scroll lock ── */

  useEffect(() => {
    const v = ACCENT_MAP[accentColor];
    if (!v) return;
    const r = document.documentElement.style;
    ['--color-accent', '--color-accent-600', '--color-accent-700', '--color-accent-200', '--color-accent-100', '--color-accent-800']
      .forEach((k, i) => r.setProperty(k, v[i]));
  }, [accentColor]);

  useEffect(() => {
    const onResize = () => set({ w: window.innerWidth });
    // Escape closes the image viewer first, then the post window under it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') set((prev) => (prev.lightbox ? { lightbox: null } : { activeId: null, replyTo: null }));
    };
    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  }, [set]);

  const locked = !!(st.activeId || st.composeOpen || st.editFor || st.hideFor || st.deleteFor || st.reportFor || st.login || st.interestsOpen || st.lightbox);
  useEffect(() => {
    document.body.classList.toggle('wnm-locked', locked);
    document.documentElement.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.classList.remove('wnm-locked');
      document.documentElement.style.overflow = '';
    };
  }, [locked]);

  /* ── What to show ── */

  // Announcements first, then everything else, filtered by view, category and search.
  // While searching, the server's results take the place of the feed (and the search term is not re-checked here).
  const feed = useMemo(() => {
    const needle = searchMode ? '' : st.q.trim().toLowerCase();
    return (searchMode ? st.results ?? [] : st.posts).filter((p) => {
      const cats = p.cats || [];
      if (st.view === 'announce' && !p.important) return false;
      if (st.view === 'interests' && !cats.some((c) => st.interests.includes(c))) return false;
      if (st.view === 'questions' && !cats.includes(QA)) return false;
      if (st.cat && !cats.includes(st.cat)) return false;
      if (needle && !`${p.title} ${p.body} ${p.name} ${cats.join(' ')}`.toLowerCase().includes(needle)) return false;
      return true;
    }).sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
  }, [st.posts, st.results, searchMode, st.view, st.interests, st.cat, st.q]);

  const cardProps = (p: Post) => ({
    cats: st.cats,
    post: p,
    liked: st.likes[p.id] ?? null,
    commentCount: (st.comments[p.id] || []).length,
    reportStatus: st.reportStatus[p.id],
    isGuest,
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
    onImage: (index: number) => {
      const images = (p.media ?? []).filter((m) => m.url && m.type === 'image').map((m) => m.url!);
      set({ lightbox: { images, index, alt: p.title } });
    },
    highlight: searchMode ? st.q : undefined,
  });

  const meInitials = isGuest ? 'G' : viewer.name.slice(0, 2);
  const meAvatar = avatarStyle(isGuest ? 3 : 0, 34);
  const openCompose = () => (isGuest ? gate() : set({ composeOpen: true, notifOpen: false }));
  const closeLogin = useCallback(() => set({ login: null }), [set]);
  const onLoginDone = useCallback((registered: boolean) => {
    set({ login: null });
    flash(registered ? 'สร้างบัญชีเรียบร้อย · ยินดีต้อนรับสู่ WhongNaiMor' : 'เข้าสู่ระบบแล้ว');
    // New members pick what to follow first, otherwise announcements never reach them.
    if (registered) set({ interestsOpen: 'welcome' });
  }, [set, flash]);

  const active = findPost(st.activeId);
  const wide = st.w >= 880;
  const phone = st.w < 640;
  const shellCols = st.w >= 1060 ? '212px minmax(0,1fr) 292px' : wide ? '176px minmax(0,1fr) 224px' : 'minmax(0,1fr)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: phone ? 96 : 60 }}>
      <TopBar
        w={st.w}
        query={st.q}
        onQuery={(q) => set({ q })}
        onHome={closePost}
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
        account={user && (
          <AccountMenu
            name={viewer.name}
            initials={meInitials}
            email={user.email ?? ''}
            isMod={isMod}
            avatar={meAvatar}
            compact={st.w < 640}
            unread={unreadNotifs}
            open={accountOpen}
            onOpenChange={(o) => { setAccountOpen(o); if (o) set({ notifOpen: false }); }}
            onNotifications={() => set({ notifOpen: true })}
            onInterests={() => set({ interestsOpen: 'edit' })}
            onProfile={() => set({ view: 'profile', activeId: null, notifOpen: false })}
            onSignOut={async () => {
              await signOut();
              setAccountOpen(false);
              flash('ออกจากระบบแล้ว · แล้วพบกันใหม่');
            }}
          />
        )}
      />

      <div style={{ maxWidth: 1220, margin: '0 auto', padding: 'clamp(14px,2vw,22px) clamp(12px,2.5vw,26px)', display: 'grid', gap: 'clamp(12px,1.6vw,20px)', gridTemplateColumns: shellCols, alignItems: 'start' }}>
        <Sidebar
          wide={wide}
          showViews={!phone}
          view={st.view}
          isMod={isMod}
          openReports={openReports}
          cats={st.cats}
          cat={st.cat}
          interests={st.interests}
          onView={(view) => set({ view, activeId: null, replyTo: null })}
          onCat={(cat) => set({ cat, activeId: null })}
          onToggleInterest={toggleInterest}
        />

        {st.view === 'moderation' && isMod ? (
          <ModerationView
            wide={wide}
            openReports={openReports}
            reports={(
              <ModerationCenter
                reports={st.modReports}
                compact={st.w < 880}
                blocked={locked}
                ensurePost={ensurePost}
                renderPost={(p) => <PostCard {...cardProps(p)} />}
                onDismiss={(id) => setStatus(id, 'Dismissed')}
                onEdit={openEdit}
                onHide={(id) => set({ hideFor: id })}
                onUnhide={unhidePost}
                onReopen={(id) => setStatus(id, 'Open')}
                onRefresh={() => { refreshReports(); flash('โหลดรายงานล่าสุดแล้ว'); }}
              />
            )}
            categories={(
              <CategoryManager
                flash={flash}
                dotFor={(id) => st.cats.find((c) => String(c.id) === id)?.dot}
                revision={st.cats.map((c) => `${c.id}:${c.name}:${c.pri}`).join('|')}
                onChanged={data.loadCats}
              />
            )}
            history={<ModerationHistory revision={liveRev} onOpenPost={openPost} />}
            roles={<RoleManager flash={flash} myId={user?.id ?? null} revision={rolesRev} />}
          />
        ) : (<>
          {st.view === 'profile' && user ? (
            <ProfileView
              name={viewer.name}
              email={user.email ?? ''}
              isMod={isMod}
              avatar={meAvatar}
              initials={meInitials}
              posts={st.mine}
              cats={st.cats}
              interests={st.interests}
              revision={liveRev}
              renderPost={(p) => <PostCard key={p.id} {...cardProps(p)} />}
              flash={flash}
              onRenamed={() => { viewer.reload(); loadPosts(); loadAnnouncements(); loadMine(); loadComments(loadedPosts); }}
              onOpenPost={openPost}
              onEditInterests={() => set({ interestsOpen: 'edit' })}
            />
          ) : (
          <Feed
            view={st.view}
            posts={feed}
            status={searchMode ? (st.results === null ? 'loading' : 'ready') : data.feedStatus}
            query={st.q}
            searchMode={searchMode}
            hasMore={data.hasMore}
            loadingMore={data.loadingMore}
            onLoadMore={data.loadMore}
            twoLanes={laneMode === 'two'}
            isGuest={isGuest}
            showInterestsNudge={!isGuest && data.interestsLoaded && st.interests.length === 0}
            me={{ initials: meInitials, avatar: meAvatar }}
            renderPost={(p) => <PostCard key={p.id} {...cardProps(p)} />}
            onCompose={openCompose}
            onPickInterests={() => set({ interestsOpen: 'edit' })}
            onRetry={data.retryFeed}
          />
          )}
          <RightRail
            wide={wide}
            announce={st.announce}
            isMod={isMod}
            openReports={openReports}
            reportsByStatus={(s) => st.modReports.filter((r) => r.tickets.length && r.status === s).length}
            onOpenPost={openPost}
            onModeration={() => set({ view: 'moderation', activeId: null })}
          />
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
          meName={viewer.name}
          meInitials={meInitials}
          meAvatar={meAvatar}
          gate={gate}
          flash={flash}
          onComment={(pid, text) => postComment(pid, text)}
          onReply={(pid, parentId, text) => postComment(pid, text, parentId)}
          onReactComment={reactToComment}
          onEditComment={editComment}
          onDeleteComment={deleteComment}
          onClose={closePost}
        />
      )}

      {st.composeOpen && (
        <ComposeDialog
          st={st}
          set={set}
          isMod={isMod}
          email={user?.email ?? ''}
          meName={viewer.name}
          meInitials={meInitials}
          meAvatar={meAvatar}
          flash={flash}
          onPosted={() => { loadPosts(); loadAnnouncements(); }}
        />
      )}
      {st.editFor && (
        <EditDialog st={st} set={set} flash={flash} setStatus={setStatus} isMod={isMod}
          onHide={(id) => set({ editFor: null, hideFor: id })} onUnhide={unhidePost} onDelete={(id) => set({ editFor: null, deleteFor: id })} />
      )}
      {st.interestsOpen && (
        <InterestsDialog
          cats={st.cats}
          selected={st.interests}
          loaded={data.interestsLoaded}
          welcome={st.interestsOpen === 'welcome'}
          onSave={saveInterests}
          onClose={() => set({ interestsOpen: false })}
        />
      )}
      {st.deleteFor && <DeleteDialog st={st} set={set} isMod={isMod} onDelete={deletePost} />}
      {st.hideFor && <HideDialog st={st} set={set} onHide={hidePost} />}
      {st.reportFor && <ReportDialog st={st} set={set} flash={flash} onSubmit={submitReport} />}
      {st.login && <LoginDialog initialMode={st.login} onClose={closeLogin} onDone={onLoginDone} />}

      {st.lightbox && (
        <ImageViewer
          {...st.lightbox}
          onIndex={(index) => set((prev) => ({ lightbox: prev.lightbox && { ...prev.lightbox, index } }))}
          onClose={() => set({ lightbox: null })}
        />
      )}

      {phone && (
        <BottomNav
          view={st.view}
          notifOpen={st.notifOpen}
          unread={unreadNotifs}
          onView={(view) => { set({ view, activeId: null, replyTo: null, notifOpen: false }); window.scrollTo({ top: 0 }); }}
          onCompose={openCompose}
          onNotifications={() => { setAccountOpen(false); set({ notifOpen: true }); }}
          onMe={() => (user ? set({ view: 'profile', activeId: null, notifOpen: false }) : gate())}
        />
      )}

      <Toast toast={toast} onAction={runAction} bottom={phone ? 92 : 24} />
    </div>
  );
}
