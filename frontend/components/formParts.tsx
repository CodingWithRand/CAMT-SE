'use client';

import type { CSSProperties } from 'react';
import type { Category } from '@/lib/data';
import { chipStyle } from '@/lib/ui';

/** Form pieces shared by the compose and edit dialogs. */

export const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export const labelStyle: CSSProperties = { fontSize: 11.5, color: 'var(--color-neutral-700)' };
const knobStyle: CSSProperties = { width: 21, height: 21, borderRadius: 999, background: '#fff', display: 'block' };
const trackStyle = (on: boolean, enabled = true): CSSProperties => ({
  cursor: enabled ? 'pointer' : 'not-allowed', border: 0, width: 48, height: 27, borderRadius: 999, padding: 3,
  display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
  background: on ? 'var(--color-accent)' : 'var(--color-neutral-300)', opacity: enabled ? 1 : 0.45,
});

export function CatPicker({ cats, selected, onToggle }: { cats: Category[]; selected: string[]; onToggle: (name: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>หมวดหมู่ · ต้องเลือกอย่างน้อย 1 หมวด</label>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {cats.map((c) => (
          <button key={c.name} className="tag" onClick={() => onToggle(c.name)} style={chipStyle(selected.includes(c.name))}>
            {c.name.split(' / ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AnnounceToggle({ note, on, enabled, onToggle }: { note: string; on: boolean; enabled?: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-accent-100)', borderRadius: 14, padding: '12px 14px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>เผยแพร่เป็นประกาศ (Announcement)</div>
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-700)' }}>{note}</div>
      </div>
      <button onClick={onToggle} style={trackStyle(on, enabled)} title={note} role="switch" aria-checked={on}>
        <span style={knobStyle} />
      </button>
    </div>
  );
}
