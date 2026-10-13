import { catDots, type Category, type Comment, type Post, type ReactionType } from './data';
import type { ModReport } from './state';
import type { CategoryRow, CommentRow, HiddenPostRow, PostRow, ReportTicketRow } from './apiTypes';
import { timeAgo } from './ui';

/** API row of v_post_all_data (plus the fields the API adds) -> the card's Post. */
export function toPost(p: PostRow): Post {
  return {
    id: p.id,
    important: p.is_important,
    name: p.author_name,
    time: timeAgo(p.created_at),
    at: p.created_at,
    initials: p.author_name.slice(0, 2),
    title: p.title,
    body: p.content,
    role: p.role,
    cats: p.categories.map((c) => c.name),
    likes: p.reaction_count,
    media: (p.medias ?? []).map((m) => ({ type: m.media_type, label: '', url: m.file_url })),
    hidden: p.is_hidden ? { reason: p.hidden_reason ?? null } : undefined,
    mine: !!p.is_mine,
    edited: p.edited_at ? (p.edited_by_mod ? 'แก้ไขโดยผู้ดูแล' : 'แก้ไขแล้ว') : undefined,
  };
}

/** /misc/categories rows -> categories with their dot colours. */
export function toCategories(rows: CategoryRow[]): Category[] {
  const dots = catDots(rows.map((c) => String(c.id)));
  return rows.map((c) => ({ id: c.id, name: c.category_name, pri: c.priority, dot: dots[c.id], desc: c.description, followers: c.follower_count ?? 0 }));
}

/**
 * /comment/fetch-many rows -> a thread per post (replies nested under their parent),
 * plus the viewer's reaction per comment. Every asked-for post gets an entry, so a
 * thread whose last comment was deleted empties out.
 */
export function buildThreads(rows: CommentRow[], postIds: string[]) {
  const threads: Record<string, Comment[]> = Object.fromEntries(postIds.map((id) => [id, []]));
  const mine: Record<string, ReactionType> = {};
  const nodes = new Map<string, Comment & { parent: string | null; post: string }>();
  for (const c of rows) {
    if (c.my_reaction) mine[c.id] = c.my_reaction;
    nodes.set(c.id, {
      id: c.id, parent: c.parent_comment_id, post: c.post_id,
      a: c.display_name, r: c.role, i: c.display_name.slice(0, 2), t: 3,
      time: timeAgo(c.created_at), text: c.content,
      likes: c.reaction_count ?? 0, mine: !!c.is_mine, replies: [],
    });
  }
  for (const node of nodes.values()) {
    const parent = node.parent ? nodes.get(node.parent) : undefined;
    if (parent) parent.replies.push(node);
    else threads[node.post]?.push(node);
  }
  return { threads, mine };
}

/**
 * /report/fetch tickets and /post/hidden rows -> one queue entry per post.
 * A post's status is Open while any ticket is open, otherwise its newest ticket's.
 */
export function groupModReports(tickets: ReportTicketRow[], hidden: HiddenPostRow[]) {
  const groups = new Map<string, ModReport>();
  const reason: Record<string, string> = {};
  for (const r of tickets) {
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
  for (const h of hidden) {
    const g = groups.get(h.id);
    if (g) { g.hidden = true; g.hiddenReason = h.hidden_reason; continue; }
    groups.set(h.id, { post_id: h.id, title: h.title || 'ไม่มีชื่อ', status: 'Reviewed', hidden: true, hiddenReason: h.hidden_reason, tickets: [] });
  }
  return { modReports: [...groups.values()], reportReason: reason };
}
