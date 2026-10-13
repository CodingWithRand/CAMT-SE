'use client';

import { useEffect, useState } from 'react';

interface Cat { id: string; name: string; pri: number; dot: string; desc?: string | null }

/**
 * Pick the categories to follow. Following a category is what brings its announcements
 * to the bell, so new members see this right after signing up.
 */
export function InterestsDialog({ cats, selected, loaded, welcome, onSave, onClose }: {
  cats: Cat[];
  selected: string[];          // category names currently followed
  loaded: boolean;             // `selected` came from the server; saving before that would wipe it
  welcome: boolean;            // shown right after sign up
  onSave: (names: string[]) => Promise<boolean>;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string[]>(selected);
  const [busy, setBusy] = useState(false);

  // Start from what the server says once it arrives (the dialog may open first).
  useEffect(() => { if (loaded) setPicked(selected); }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, busy]);

  const toggle = (name: string) => setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));
  const changed = picked.length !== selected.length || picked.some((x) => !selected.includes(x));

  const save = async () => {
    setBusy(true);
    const ok = await onSave(picked);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 46, animation: 'wnm-pop .16s ease both' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="interests-title"
        style={{ width: 'min(560px, 100%)', maxHeight: '92vh', overflow: 'auto', gap: 14, borderRadius: 22 }}>
        <div>
          <h4 id="interests-title" style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 700 }}>
            {welcome ? 'ยินดีต้อนรับ! เลือกหมวดที่คุณสนใจ' : 'หมวดที่ติดตาม'}
          </h4>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
            เมื่อมีประกาศในหมวดที่ติดตาม คุณจะได้รับแจ้งเตือนที่ 🔔 · โพสต์จากหมวดเหล่านี้ยังรวมอยู่ในเมนู &ldquo;หมวดที่ฉันสนใจ&rdquo;
          </p>
        </div>

        <div role="group" aria-label="หมวดหมู่" style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))' }}>
          {cats.map((c) => {
            const on = picked.includes(c.name);
            return (
              <button key={c.id} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(c.name)}
                style={{ cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '12px 13px', borderRadius: 14, color: 'var(--color-text)',
                  border: `1.5px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                  background: on ? 'var(--color-accent-100)' : 'var(--color-neutral-100)', transition: 'background .15s, border-color .15s' }}>
                <span aria-hidden="true" style={{ flex: 'none', width: 20, height: 20, marginTop: 1, borderRadius: 6, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: '#fff',
                  background: on ? 'var(--color-accent)' : 'transparent', border: on ? 'none' : '1.5px solid var(--color-neutral-400)' }}>{on ? '✓' : ''}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: c.dot, flex: 'none' }} />
                    {c.name}
                  </span>
                  {c.desc && <span style={{ display: 'block', fontSize: 12, color: 'var(--color-neutral-700)', marginTop: 2, lineHeight: 1.4 }}>{c.desc}</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, color: 'var(--color-neutral-700)', marginRight: 'auto' }}>
            {!loaded ? 'กำลังโหลดหมวดที่ติดตาม…' : picked.length ? `เลือกแล้ว ${picked.length} หมวด` : 'ยังไม่ได้เลือก · จะไม่ได้รับแจ้งเตือนประกาศ'}
          </span>
          <button className="btn btn-secondary" onClick={onClose} disabled={busy} style={{ fontFamily: 'var(--font-body)' }}>
            {welcome ? 'ข้ามไปก่อน' : 'ยกเลิก'}
          </button>
          <button className="btn btn-primary" onClick={save} disabled={busy || !loaded || (!welcome && !changed)} style={{ fontFamily: 'var(--font-body)' }}>
            {busy ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}
