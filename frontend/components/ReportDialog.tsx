'use client';

import { useState } from 'react';
import { REASONS } from '@/lib/data';
import type { AppState, SetState } from '@/lib/state';
import { labelStyle } from './formParts';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function ReportDialog({ st, set, flash, onSubmit }: {
  st: AppState;
  set: SetState;
  flash: (t: string) => void;
  /** Resolves to an error message, or null when the report was saved. */
  onSubmit: (postId: string, reason: string) => Promise<string | null>;
}) {
  const id = st.reportFor!;
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const trap = useFocusTrap<HTMLDivElement>();
  const close = () => { if (!busy) set({ reportFor: null, reason: null }); };

  const submit = async () => {
    if (!st.reason || busy) return;
    setBusy(true);
    const reason = details.trim() ? `${st.reason} · ${details.trim()}` : st.reason;
    const err = await onSubmit(id, reason);
    setBusy(false);
    set({ reportFor: null, reason: null });
    flash(err ?? 'ส่งรายงานแล้ว · ผู้ดูแลจะตรวจสอบและแจ้งผลให้คุณทราบ');
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 41, animation: 'wnm-pop .16s ease both' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={trap} className="dialog" role="dialog" aria-modal="true" aria-labelledby="report-title" style={{ gap: 12, borderRadius: 20 }}>
        <h4 id="report-title" className="dialog-title" style={{ margin: 0, fontSize: 16 }}>รายงานโพสต์นี้</h4>
        <p className="dialog-body" style={{ margin: 0, fontSize: 13 }}>
          ผู้ดูแลจะเห็นเหตุผลของคุณ แต่คนอื่นจะไม่รู้ว่าใครรายงาน โพสต์จะขึ้นสถานะ &ldquo;รอตรวจสอบ&rdquo; และคุณจะได้รับการแจ้งเตือนเมื่อผู้ดูแลตรวจเสร็จ
        </p>
        <div role="radiogroup" aria-label="เหตุผล" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {REASONS.map((r) => {
            const on = st.reason === r;
            return (
              <button key={r} role="radio" aria-checked={on} className="hov-border" onClick={() => set({ reason: r })} style={{ cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 13, padding: '11px 15px', borderRadius: 999, background: on ? 'var(--color-accent-100)' : 'var(--color-neutral-100)', border: `1.5px solid ${on ? 'var(--color-accent)' : 'transparent'}`, color: 'var(--color-text)' }}>
                {r}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="report-details" style={labelStyle}>รายละเอียดเพิ่มเติม (ไม่บังคับ)</label>
          <textarea id="report-details" className="input" maxLength={200} value={details} onChange={(e) => setDetails(e.target.value)}
            placeholder="ช่วยให้ผู้ดูแลเข้าใจปัญหาได้เร็วขึ้น" style={{ borderRadius: 14, minHeight: 64, background: 'var(--color-neutral-100)', fontSize: 13 }} />
          <span style={{ alignSelf: 'flex-end', fontSize: 10.5, color: 'var(--color-neutral-600)' }}>{details.length}/200</span>
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={close} disabled={busy}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={submit} disabled={!st.reason || busy}>{busy ? 'กำลังส่ง…' : 'ส่งรายงาน'}</button>
        </div>
      </div>
    </div>
  );
}
