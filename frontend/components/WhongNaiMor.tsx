'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { QA, type Post, type ReactionType } from '@/lib/data';
import { toPost } from '@/lib/mappers';
import { INITIAL, findPostIn, type AppState, type SetState, type ViewerRole } from '@/lib/state';
import { ACCENT_MAP, avatarStyle } from '@/lib/ui';
import { useFeedData } from '@/hooks/useFeedData';
import { useInterests } from '@/hooks/useInterests';
import { useNotifications } from '@/hooks/useNotifications';
import { usePostActions } from '@/hooks/usePostActions';
import { useReactions } from '@/hooks/useReactions';
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
  // The feed is filtered by the API (so a filter sees every matching post, not just loaded pages).
  const feedFilter = [
    st.view === 'announce' && 'important=1',
    st.view === 'interests' && user && 'following=1',
    st.cat && `categories=${st.cat}`,
  ].filter(Boolean).join('&');
  const feedKey = st.view === 'interests' ? `${feedFilter}|${[...st.interests].sort().join(',')}` : feedFilter;
  const data = useFeedData(set, { signedIn: !!user, isMod, hiddenLocally, filter: feedFilter, filterKey: feedKey });
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

  const interests = useInterests({
    interests: st.interests, cats: st.cats, loaded: data.interestsLoaded, set, flash, isGuest,
    onGuest: gate, reload: data.loadInterests, onSaved: data.loadCats,   // follower counts
  });

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

  const reactions = useReactions(st, set, flash);
  const actions = usePostActions({ st, set, flash, defer, loadComments, loadPosts, refreshReports });
  const notifications = useNotifications(st.notifs, set, flash, !!user, openPost);

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
  // Posts carry category names; the page keeps ids.
  const catName = st.cats.find((c) => c.id === st.cat)?.name ?? null;
  const followedNames = useMemo(() => st.cats.filter((c) => st.interests.includes(c.id)).map((c) => c.name), [st.cats, st.interests]);

  // The API already filtered the feed by view and category; this re-applies it to what is on screen
  // (e.g. right after following or switching, before the new page arrives).
  // While searching, the server's results take the place of the feed (and the search term is not re-checked here).
  const feed = useMemo(() => {
    const needle = searchMode ? '' : st.q.trim().toLowerCase();
    return (searchMode ? st.results ?? [] : st.posts).filter((p) => {
      const cats = p.cats || [];
      if (st.view === 'announce' && !p.important) return false;
      if (st.view === 'interests' && !cats.some((c) => followedNames.includes(c))) return false;
      if (st.view === 'questions' && !cats.includes(QA)) return false;
      if (catName && !cats.includes(catName)) return false;
      if (needle && !`${p.title} ${p.body} ${p.name} ${cats.join(' ')}`.toLowerCase().includes(needle)) return false;
      return true;
    }).sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
  }, [st.posts, st.results, searchMode, st.view, followedNames, catName, st.q]);

  const cardProps = (p: Post) => ({
    cats: st.cats,
    post: p,
    liked: st.likes[p.id] ?? null,
    commentCount: (st.comments[p.id] || []).length,
    reportStatus: st.reportStatus[p.id],
    isGuest,
    onReact: (r: ReactionType, change: boolean) => reactions.onPost(p.id, r, change),
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
        unread={notifications.unread}
        notifOpen={st.notifOpen}
        onNotifOpen={(o) => { if (o) setAccountOpen(false); set({ notifOpen: o }); }}
        onOpenNotif={notifications.open}
        onReadAll={notifications.readAll}
        account={user && (
          <AccountMenu
            name={viewer.name}
            initials={meInitials}
            email={user.email ?? ''}
            isMod={isMod}
            avatar={meAvatar}
            compact={st.w < 640}
            unread={notifications.unread}
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
          onToggleInterest={interests.toggle}
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
                onDismiss={(id) => actions.setStatus(id, 'Dismissed')}
                onEdit={openEdit}
                onHide={(id) => set({ hideFor: id })}
                onUnhide={actions.unhidePost}
                onReopen={(id) => actions.setStatus(id, 'Open')}
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
            category={(() => {
              const c = st.cats.find((x) => x.id === st.cat);
              return c ? { name: c.name, dot: c.dot, followers: c.followers ?? 0, followed: st.interests.includes(c.id), onToggle: () => interests.toggle(c.id) } : null;
            })()}
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
          onComment={(pid, text) => actions.postComment(pid, text)}
          onReply={(pid, parentId, text) => actions.postComment(pid, text, parentId)}
          onReactComment={reactions.onComment}
          onEditComment={actions.editComment}
          onDeleteComment={actions.deleteComment}
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
        <EditDialog st={st} set={set} flash={flash} setStatus={actions.setStatus} isMod={isMod}
          onHide={(id) => set({ editFor: null, hideFor: id })} onUnhide={actions.unhidePost} onDelete={(id) => set({ editFor: null, deleteFor: id })} />
      )}
      {st.interestsOpen && (
        <InterestsDialog
          cats={st.cats}
          selected={st.interests}
          loaded={data.interestsLoaded}
          welcome={st.interestsOpen === 'welcome'}
          onSave={interests.save}
          onClose={() => set({ interestsOpen: false })}
        />
      )}
      {st.deleteFor && <DeleteDialog st={st} set={set} isMod={isMod} onDelete={actions.deletePost} />}
      {st.hideFor && <HideDialog st={st} set={set} onHide={actions.hidePost} />}
      {st.reportFor && <ReportDialog st={st} set={set} flash={flash} onSubmit={actions.submitReport} />}
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
          unread={notifications.unread}
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
