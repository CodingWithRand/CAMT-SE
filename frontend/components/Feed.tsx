'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { Post } from '@/lib/data';
import type { View } from '@/lib/state';
import type { FeedStatus } from '@/hooks/useFeedData';

const HEADINGS: Partial<Record<View, [string, string]>> = {
  announce: ['ประกาศทั้งหมด', 'โพสต์จากหน่วยงานและบุคลากร'],
  interests: ['จากหมวดที่ฉันสนใจ', 'ตามหมวดที่คุณบันทึกไว้'],
};

/** Center column: prompts above the feed, the posts, and the loading / error / empty states. */
export function Feed({ view, posts, status, query, searchMode, hasMore, loadingMore, twoLanes, isGuest, showInterestsNudge, me, renderPost, onCompose, onPickInterests, onRetry, onLoadMore }: {
  view: View;
  posts: Post[];
  status: FeedStatus;
  query: string;
  searchMode: boolean;   // showing server search results for `query`
  hasMore: boolean;
  loadingMore: boolean;
  twoLanes: boolean;
  isGuest: boolean;
  showInterestsNudge: boolean;
  me: { initials: string; avatar: CSSProperties };
  renderPost: (p: Post) => ReactNode;
  onCompose: () => void;
  onPickInterests: () => void;
  onRetry: () => void;
  onLoadMore: () => void;
}) {
  const q = query.trim();
  const [title, subtitle] = searchMode
    ? ['ผลการค้นหา', `"${q}" จากทุกโพสต์ในชุมชน`]
    : HEADINGS[view] ?? ['ฟีดรวม', 'ประกาศขึ้นก่อน แล้วตามด้วยโพสต์ทั่วไป'];

  // Infinite scroll: load the next page when the end of the list comes near. Observing again
  // after every page means a short (filtered) list keeps loading while the end stays in view.
  const end = useRef<HTMLDivElement>(null);
  const more = useRef(onLoadMore);
  more.current = onLoadMore;
  const canLoad = hasMore && !searchMode && status === 'ready';
  useEffect(() => {
    const el = end.current;
    if (!el || !canLoad || loadingMore) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) more.current(); }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [canLoad, loadingMore, posts.length]);

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      {showInterestsNudge && (
        <div role="note" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 15px', borderRadius: 14, background: 'var(--color-accent-100)', border: '1px solid var(--color-accent-300)' }}>
          <span aria-hidden="true" style={{ fontSize: 20 }}>🔔</span>
          <span style={{ flex: '1 1 220px', fontSize: 13, lineHeight: 1.5, color: 'var(--color-accent-900)' }}>
            <strong>ยังไม่ได้ติดตามหมวดไหน</strong> · เลือกหมวดที่สนใจเพื่อรับแจ้งเตือนเมื่อมีประกาศ
          </span>
          <button className="btn btn-primary" onClick={onPickInterests} style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>เลือกหมวด</button>
        </div>
      )}

      {isGuest ? (
        <div style={{ padding: '10px 15px', borderRadius: 12, fontSize: 12.5, lineHeight: 1.5, background: 'var(--color-neutral-200)', color: 'var(--color-neutral-900)' }}>
          กำลังดูในฐานะผู้ใช้ภายนอก (Non-CMU) · อ่านได้เท่านั้น
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 16, padding: '12px 14px' }}>
          <span style={me.avatar}>{me.initials}</span>
          <button className="hov-bg" onClick={onCompose} style={{ flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer', border: 0, background: 'var(--color-neutral-100)', borderRadius: 999, padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-neutral-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            แบ่งปันเรื่องราวกับชุมชน มช. …
          </button>
          <button className="btn btn-primary" onClick={onCompose} style={{ flex: 'none', padding: '8px 20px', fontSize: 13 }}>โพสต์</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '0 2px' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h3>
        <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>{subtitle}</span>
        <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', marginLeft: 'auto' }}>{posts.length} โพสต์</span>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: twoLanes ? 'repeat(auto-fit,minmax(min(100%,320px),1fr))' : '1fr', alignItems: 'start' }}>
        {posts.map(renderPost)}
      </div>

      {posts.length === 0 && status === 'loading' && (
        <div aria-busy="true" aria-label="กำลังโหลดโพสต์" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-card">
              <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                <span className="skeleton" style={{ width: 38, height: 38, borderRadius: 999 }} />
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="skeleton" style={{ width: '40%', height: 12 }} />
                  <span className="skeleton" style={{ width: '22%', height: 10 }} />
                </span>
              </div>
              <span className="skeleton" style={{ width: '70%', height: 15 }} />
              <span className="skeleton" style={{ width: '95%', height: 11 }} />
              <span className="skeleton" style={{ width: '82%', height: 11 }} />
            </div>
          ))}
        </div>
      )}
      {posts.length === 0 && status === 'error' && (
        <div role="alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', padding: '30px 18px', borderRadius: 16, background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}>
          <span aria-hidden="true" style={{ fontSize: 28 }}>📡</span>
          <strong style={{ fontSize: 15 }}>เชื่อมต่อเซิร์ฟเวอร์ไม่ได้</strong>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>ตรวจสอบอินเทอร์เน็ต แล้วลองใหม่อีกครั้ง · ระบบจะลองเองทุก 30 วินาที</span>
          <button className="btn btn-primary" onClick={onRetry} style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>ลองใหม่</button>
        </div>
      )}
      <div ref={end} aria-hidden={!loadingMore} style={{ minHeight: 1 }}>
        {loadingMore && <p style={{ margin: 0, padding: '14px 0', textAlign: 'center', fontSize: 12.5, color: 'var(--color-neutral-600)' }}>กำลังโหลดโพสต์เพิ่ม…</p>}
        {!searchMode && !hasMore && status === 'ready' && posts.length > 0 && (
          <p style={{ margin: 0, padding: '14px 0', textAlign: 'center', fontSize: 12, color: 'var(--color-neutral-600)' }}>ดูครบทุกโพสต์แล้ว</p>
        )}
      </div>

      {posts.length === 0 && status === 'ready' && (searchMode || !hasMore) && (
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', padding: '26px 4px', margin: 0, textAlign: 'center' }}>
          {q ? `ไม่พบโพสต์ที่ตรงกับ "${q}"` : 'ไม่มีโพสต์ที่ตรงกับตัวกรองนี้'}
        </p>
      )}
    </main>
  );
}
