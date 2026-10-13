import type { CSSProperties } from 'react';
import { TINTS, type Post, type ReportStatus } from './data';

export function avatarStyle(tint: number, size = 38): CSSProperties {
  const [bg, fg] = TINTS[tint % TINTS.length];
  return {
    width: size, height: size, flex: 'none', display: 'grid', placeItems: 'center',
    fontSize: Math.round(size * 0.32), fontWeight: 700, background: bg, color: fg, borderRadius: 999,
  };
}

/** Report status words, used everywhere a status is shown (post chip, moderation center, dialogs). */
export const REPORT_LABEL: Record<ReportStatus, string> = {
  Open: 'รอตรวจ',
  Reviewed: 'จัดการแล้ว',     // a moderator edited or hid the post
  Dismissed: 'ไม่พบปัญหา',   // checked, nothing wrong
};

export function statusLook(status?: ReportStatus): [string, string] {
  switch (status) {
    case 'Open': return ['#f2c6b6', '#6f2f14'];
    case 'Reviewed': return ['#dcebc4', '#3d472b'];
    default: return ['var(--color-neutral-200)', 'var(--color-neutral-800)'];
  }
}

export function chipStyle(active: boolean): CSSProperties {
  return {
    cursor: 'pointer', fontSize: 11.5, padding: '5px 12px', borderRadius: 999, fontFamily: 'var(--font-body)',
    border: `1px solid ${active ? 'transparent' : 'var(--color-divider)'}`,
    background: active ? 'var(--color-accent)' : 'var(--color-surface)',
    color: active ? '#fff' : 'var(--color-neutral-800)',
  };
}

export const ACCENT_MAP: Record<string, string[]> = {
  '#7d50a8': ['#7d50a8', '#6c4194', '#54307a', '#eadff7', '#f7f1fc', '#3e2259'],
  '#8f6bb5': ['#8f6bb5', '#7a55a2', '#5f3f83', '#ece2f6', '#f8f4fc', '#453166'],
  '#6a3d8f': ['#6a3d8f', '#5a2f7d', '#452363', '#e7dbf3', '#f6f0fb', '#33194d'],
};

/**
 * Relative time for the last week ("5 นาทีที่แล้ว", "เมื่อวาน"), then a date ("17 ก.ย."),
 * with the Buddhist-era year once it is not this year. Hover text comes from fullDate().
 */
export function timeAgo(stamp: Date | string) {
  const t = new Date(stamp);
  const sec = Math.floor((Date.now() - t.getTime()) / 1000);
  if (sec < 60) return 'เมื่อสักครู่';
  if (sec < 3600) return `${Math.floor(sec / 60)} นาทีที่แล้ว`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ชั่วโมงที่แล้ว`;
  // Whole calendar days, so 11 Oct read on 13 Oct is "2 วันที่แล้ว", not "เมื่อวาน".
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(t)) / 86400000);
  if (days === 1) return 'เมื่อวาน';
  if (days < 7) return `${days} วันที่แล้ว`;
  const sameYear = t.getFullYear() === new Date().getFullYear();
  return t.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
}

/** "17 กันยายน 2569 เวลา 16:11" for tooltips. */
export function fullDate(stamp: Date | string) {
  return new Date(stamp).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
}
