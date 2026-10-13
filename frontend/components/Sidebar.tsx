'use client';

import type { CSSProperties } from 'react';
import type { Category } from '@/lib/data';
import type { View } from '@/lib/state';

const VIEWS: [View, string][] = [['home', 'หน้าแรก'], ['announce', 'ประกาศ'], ['interests', 'หมวดที่ฉันสนใจ']];

const viewButton = (on: boolean): CSSProperties => ({
  cursor: 'pointer', border: 0, textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 13, padding: '9px 12px', borderRadius: 10,
  background: on ? 'var(--color-accent-200)' : 'transparent', color: on ? 'var(--color-accent-800)' : 'var(--color-neutral-800)', fontWeight: on ? 600 : 400,
});

/** Left column: the views, the moderation entry, and the category filter. A row of chips on narrow screens. */
export function Sidebar({ wide, showViews, view, isMod, openReports, cats, cat, interests, onView, onCat, onToggleInterest }: {
  wide: boolean;
  showViews: boolean;   // off on phones, where the bottom bar has them
  view: View;
  isMod: boolean;
  openReports: number;
  cats: Category[];
  cat: string | null;
  interests: string[];
  onView: (v: View) => void;
  onCat: (name: string | null) => void;
  onToggleInterest: (name: string) => void;
}) {
  return (
    <aside style={{ display: 'flex', gap: wide ? 14 : 8, flexDirection: wide ? 'column' : 'row', flexWrap: 'wrap', position: wide ? 'sticky' : 'static', top: 84, minWidth: 0 }}>
      {(showViews || isMod) && <nav style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: wide ? 16 : 999, padding: wide ? 8 : '5px 6px', display: 'flex', flexDirection: wide ? 'column' : 'row', gap: wide ? 2 : 4, flex: 'none', maxWidth: '100%', overflowX: wide ? 'visible' : 'auto' }}>
        {showViews && VIEWS.map(([k, l]) => (
          <button key={k} className="hov-bg" onClick={() => onView(k)} style={viewButton(view === k)}>{l}</button>
        ))}
        {isMod && (
          <button className="hov-bg" onClick={() => onView('moderation')}
            style={{ ...viewButton(view === 'moderation'), display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            <span style={{ flex: 1 }}>⚑ ศูนย์ผู้ดูแล</span>
            {openReports > 0 && (
              <span style={{ minWidth: 20, height: 20, padding: '0 6px', display: 'grid', placeItems: 'center', borderRadius: 999, background: 'var(--pri)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{openReports}</span>
            )}
          </button>
        )}
      </nav>}

      <div style={wide
        ? { background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 16, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 3 }
        : { display: 'flex', flexDirection: 'row', gap: 6, flex: '1 1 240px', minWidth: 0, overflowX: 'auto', padding: '2px 0', alignItems: 'center' }}
      >
        {wide && <span style={{ fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', padding: '0 6px 7px' }}>หมวดหมู่</span>}
        {cats.map((c) => {
          const on = cat === c.name;
          return (
            <button
              key={c.name}
              className="hov-bg"
              title={`Priority ${c.pri}`}
              onClick={() => onCat(on ? null : c.name)}
              style={wide
                ? { cursor: 'pointer', border: 0, display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-body)', fontSize: 12.5, padding: '7px 8px', borderRadius: 9, background: on ? 'var(--color-accent-100)' : 'transparent', color: 'var(--color-neutral-800)' }
                : { cursor: 'pointer', flex: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 12, padding: '7px 12px', borderRadius: 999, border: `1px solid ${on ? 'transparent' : 'var(--color-divider)'}`, background: on ? 'var(--color-accent-200)' : 'var(--color-surface)', color: 'var(--color-neutral-800)' }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 999, flex: 'none', background: c.dot }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{c.name}</span>
              <span style={{ fontSize: 10.5, color: 'var(--color-accent-700)' }}>{interests.includes(c.name) ? '★' : ''}</span>
            </button>
          );
        })}
        {cat && (
          <button className="btn btn-ghost" onClick={() => onToggleInterest(cat)}
            style={{ fontSize: 11.5, color: 'var(--color-accent-700)', justifyContent: 'flex-start', padding: '7px 8px', marginTop: 4 }}>
            {interests.includes(cat) ? 'ลบหมวดนี้จากความสนใจ' : 'บันทึกหมวดนี้เป็นความสนใจ'}
          </button>
        )}
      </div>
    </aside>
  );
}
