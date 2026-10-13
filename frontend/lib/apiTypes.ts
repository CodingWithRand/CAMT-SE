/** Shapes of what the API answers (api/src/endpoints/*). Only the fields the page reads. */
import type { ReactionType, ReportStatus, Role } from './data';

/** v_post_all_data row plus what the API adds (posts.ts: decorate / forViewer). */
export interface PostRow {
  id: string;
  title: string;
  content: string;
  is_important: boolean;
  author_name: string;
  role: Role;
  categories: { name: string; priority?: number; description?: string | null }[];
  medias: { media_type: 'image' | 'video'; file_url: string }[] | null;
  reaction_count: number;
  created_at: string;
  is_mine?: boolean;
  edited_at?: string | null;
  edited_by_mod?: boolean;
  my_reaction?: ReactionType | null;
  is_hidden?: boolean;
  hidden_reason?: string | null;
}

/** GET /post/fetch?limit=… */
export interface PostPage { posts: PostRow[]; next_before: string | null }

/** GET /misc/categories */
export interface CategoryRow { id: string; category_name: string; priority: number; description: string | null; follower_count?: number }

/** GET /comment/fetch-many (v_comments plus reaction data and ownership) */
export interface CommentRow {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  display_name: string;
  role: Role;
  content: string;
  created_at: string;
  reaction_count?: number;
  my_reaction?: ReactionType | null;
  is_mine?: boolean;
}

/** GET /report/fetch (moderators) */
export interface ReportTicketRow {
  post_id: string;
  status: ReportStatus;
  reason: string;
  created_at: string;
  post_hidden: boolean;
  post: { title: string | null } | null;
  reporter: { display_name: string } | null;
}

/** GET /post/hidden (moderators) */
export interface HiddenPostRow { id: string; title: string | null; hidden_reason: string | null }
