import type { CSSProperties } from 'react';
import { TINTS, type Post, type ReportStatus } from './data';

export function avatarStyle(tint: number, size = 38): CSSProperties {
  const [bg, fg] = TINTS[tint % TINTS.length];
  return {
    width: size, height: size, flex: 'none', display: 'grid', placeItems: 'center',
    fontSize: Math.round(size * 0.32), fontWeight: 700, background: bg, color: fg, borderRadius: 999,
  };
}

/**
 * Total reactions on a post.
 *
 * p.likes is reaction_count straight from the server and already includes the
 * viewer's own reaction, so nothing is added here. It used to take a `liked`
 * flag and add one, back when reactions were never persisted and the count
 * could not know about them — keeping that would double-count.
 */
export function likeCount(p: Post) {
  return p.likes;
}

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
