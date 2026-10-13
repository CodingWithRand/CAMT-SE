import type { CSSProperties } from 'react';

export type Role = 'org' | 'staff' | 'mod' | 'student';
export type ReportStatus = 'Open' | 'Reviewed' | 'Dismissed';

// Mirrors the Postgres enum public.reaction_type, which the react endpoints accept.
export const REACTIONS = ['like', 'love', 'haha', 'sad', 'angry', 'care'] as const;
export type ReactionType = typeof REACTIONS[number];

/** Emoji + Thai label for each reaction, in picker order. */
export const REACTION_LOOK: Record<ReactionType, { icon: string; label: string }> = {
  like: { icon: '👍', label: 'ถูกใจ' },
  love: { icon: '❤️', label: 'รักเลย' },
  haha: { icon: '😄', label: 'ฮา' },
  sad: { icon: '😢', label: 'เศร้า' },
  angry: { icon: '😠', label: 'โกรธ' },
  care: { icon: '🤗', label: 'ห่วงใย' },
};

export interface Media { type: 'image' | 'video'; label: string; url?: string }

export interface Post {
  id: string;
  important: boolean;
  name: string;
  time: string;
  initials: string;
  title: string;
  body: string;
  role: Role;
  cats: string[];
  likes: number;
  media?: Media[];
  notified?: number;
  reports?: number;
  hidden?: { reason: string | null };   // hidden by a moderator; only the author and moderators still get it
  mine?: boolean;   // written by the viewer, who may edit and delete it
  at?: string;      // created_at, for the full date on hover
  edited?: string;  // "edited" label, when the post was changed after posting

  // Not filled from the API yet; the card still supports them.
  type?: 'announce' | 'question' | 'story' | 'market';
  priority?: 'urgent' | 'notice' | null;
  meta?: string;
  tint?: number;
}

export interface Reply { id: string; a: string; i: string; t: number; time: string; text: string; likes?: number; mine?: boolean }
export interface Comment extends Reply { r: Role; likes: number; replies: Reply[] }

export const TINTS: [string, string][] = [
  ['#eadff7', '#3e2259'], ['#f8dde8', '#66324a'], ['#e1eecc', '#3d472b'],
  ['#dbe7f5', '#2c3f57'], ['#fbeccd', '#5c4718'], ['#f7ddd6', '#6b2f1c'],
];

// The categories table has no colour column, so each category takes a dot colour
// from this palette. Ordered so neighbours are easy to tell apart.
export const CAT_DOTS = ['#7d50a8', '#c9603f', '#3f7ea8', '#5f8f5a', '#c9913f', '#cd7e9f', '#2f9c95', '#a2988f'];

/**
 * Colour per category id. Ranked by id rather than by position in the response,
 * so a category keeps its colour even if the API returns the rows in another order.
 */
export function catDots(ids: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  [...ids].sort().forEach((id, i) => { out[id] = CAT_DOTS[i % CAT_DOTS.length]; });
  return out;
}

/** A category as the page uses it; `dot` is its colour from catDots(). */
export interface Category { id: string; name: string; pri: number; dot: string; desc?: string | null; followers?: number }

export const REASONS = [
  'ข้อมูลเท็จ / Misinformation', 'เปิดเผยข้อมูลส่วนบุคคล (PDPA)',
  'คุกคามหรือใช้ถ้อยคำรุนแรง', 'สแปมหรือโฆษณา', 'อื่น ๆ',
];

export const STATUSES: ReportStatus[] = ['Open', 'Reviewed', 'Dismissed'];
export const QA = 'คำถาม / Q&A';
export const ANNOUNCE_CAT = 'ประกาศ / Announcements';

// User.Role carries only isCMUP / isMod — office accounts are CMU Personnel with an office DisplayName.
export const ROLE_LABEL: Record<Role, string> = { org: 'บุคลากร', staff: 'บุคลากร', mod: 'ผู้ดูแล', student: 'นักศึกษา' };
export const ROLE_STYLE: Record<Role, CSSProperties> = {
  org: { background: 'var(--color-accent-200)', color: 'var(--color-accent-800)' },
  staff: { background: 'var(--color-accent-2-200)', color: 'var(--color-accent-2-800)' },
  mod: { background: 'var(--success-soft)', color: 'var(--success-ink)' },
  student: { background: 'var(--color-neutral-200)', color: 'var(--color-neutral-800)' },
};
