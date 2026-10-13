import type { AuthMode } from '@/components/LoginDialog';
import type { Category, Comment, Post, ReactionType, ReportStatus } from './data';

export type ViewerRole = 'student' | 'moderator' | 'guest';
export type View = 'home' | 'announce' | 'interests' | 'questions' | 'moderation';

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

/** Page state shared by the main component and the dialogs (which get `st` and `set`). */
export interface AppState {
  view: View;
  activeId: string | null;
  cat: string | null;
  q: string;
  cats: Category[];
  likes: Record<string, ReactionType>;      // post id -> this viewer's reaction
  cLikes: Record<string, ReactionType>;     // comment id -> this viewer's reaction
  comments: Record<string, Comment[]>;
  posts: Post[];
  announce: Post[];
  extraPosts: Post[];                       // opened from a link or notification, not in the feed
  notifs: Notif[];
  interests: string[];
  reportStatus: Record<string, ReportStatus>;   // keyed by post id, visible to everyone
  reportCount: Record<string, number>;          // keyed by post id
  myReports: Record<string, boolean>;           // posts this viewer has reported
  reportReason: Record<string, string>;         // keyed by post id, newest reason (moderators only)
  modReports: ModReport[];                      // moderator queue
  // Post modal: comment composer and replies
  draft: string;
  composerOpen: boolean;
  replyTo: string | null;
  replyDraft: string;
  openReplies: Record<string, boolean>;
  shown: number;
  // Compose dialog
  composeOpen: boolean;
  newTitle: string;
  newText: string;
  newCats: string[];
  newMedia: NewMedia[];
  newImportant: boolean;
  // Report, edit, hide and delete dialogs (each open for one post id)
  reportFor: string | null;
  reason: string | null;
  editFor: string | null;
  hideFor: string | null;
  deleteFor: string | null;
  editTitle: string;
  editBody: string;
  editCats: string[];
  editImportant: boolean;
  notifOpen: boolean;
  login: AuthMode | null;   // which tab of the login dialog is open, if any
  interestsOpen: false | 'welcome' | 'edit';   // the follow-categories dialog
  w: number;                // viewport width
}

export type SetState = (patch: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => void;

export const INITIAL: AppState = {
  view: 'home', activeId: null, cat: null, q: '', cats: [],
  likes: {}, cLikes: {}, comments: {}, posts: [], announce: [], extraPosts: [], notifs: [], interests: [],
  reportStatus: {}, reportReason: {}, reportCount: {}, myReports: {}, modReports: [],
  draft: '', composerOpen: false, replyTo: null, replyDraft: '', openReplies: {}, shown: 12,
  composeOpen: false, newTitle: '', newText: '', newCats: [], newMedia: [], newImportant: false,
  reportFor: null, reason: null,
  editFor: null, hideFor: null, deleteFor: null, editTitle: '', editBody: '', editCats: [], editImportant: false,
  notifOpen: false, login: null, interestsOpen: false,
  w: 1280,
};

/** A loaded post by id: from the feed, the announcements, or opened on its own. */
export const findPostIn = (st: Pick<AppState, 'posts' | 'announce' | 'extraPosts'>, id: string | null) =>
  st.posts.find((p) => p.id === id) || st.announce.find((p) => p.id === id) || st.extraPosts.find((p) => p.id === id);

/** Apply `fn` to every copy of a post (it can be in several lists at once). */
export const mapAllPosts = (st: Pick<AppState, 'posts' | 'announce' | 'extraPosts'>, fn: (list: Post[]) => Post[]) =>
  ({ posts: fn(st.posts), announce: fn(st.announce), extraPosts: fn(st.extraPosts) });
