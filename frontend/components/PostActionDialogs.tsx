'use client';

import { useState } from 'react';
import { findPostIn, type AppState, type SetState } from '@/lib/state';
import { REPORT_LABEL, chipStyle } from '@/lib/ui';
import { useFocusTrap } from '@/hooks/useFocusTrap';

/* ── Delete (the author, or a moderator) ── */

export function DeleteDialog({ st, set, isMod, onDelete }: {
  st: AppState;
  set: SetState;
  isMod: boolean;
  onDelete: (id: string) => Promise<void>;
}) {
  const id = st.deleteFor!;
  const post = findPostIn(st, id);
  const mine = !!post?.mine;
  const [busy, setBusy] = useState(false);
  const trap = useFocusTrap<HTMLDivElement>();
  const close = () => { if (!busy) set({ deleteFor: null }); };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 44, animation: 'wnm-pop .16s ease both' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={trap} className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" style={{ gap: 12, borderRadius: 20 }}>
        <h4 id="delete-title" className="dialog-title" style={{ margin: 0, fontSize: 16 }}>{mine ? 'ลบโพสต์นี้?' : 'ลบโพสต์นี้ถาวร?'}</h4>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, background: 'var(--color-neutral-100)', borderRadius: 12, padding: '9px 12px' }}>
          <strong style={{ display: 'block' }}>{post?.title ?? 'โพสต์'}</strong>
          {!mine && <span style={{ color: 'var(--color-neutral-700)' }}>{post?.name ?? ''}</span>}
        </div>
        <p className="dialog-body" style={{ margin: 0, fontSize: 13 }}>
          โพสต์ ความคิดเห็น และรีแอคทั้งหมดของโพสต์นี้จะถูกลบ และกู้คืนไม่ได้
          {!mine && isMod && ' · ถ้าแค่ต้องการเอาออกจากฟีด แนะนำให้ "ซ่อนโพสต์" แทน เพราะเก็บประวัติรายงานไว้ และแสดงโพสต์อีกครั้งได้'}
        </p>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={close} disabled={busy}>ยกเลิก</button>
          <button className="btn" disabled={busy} autoFocus
            onClick={async () => { setBusy(true); await onDelete(id); setBusy(false); }}
            style={{ background: 'var(--danger)', color: '#fff', fontWeight: 600 }}>
            {busy ? 'กำลังลบ…' : 'ลบโพสต์'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Hide (moderators) ── */

const HIDE_REASONS = ['ละเมิดกฎชุมชน', 'ข้อมูลเท็จหรือทำให้เข้าใจผิด', 'คุกคามหรือใช้ถ้อยคำรุนแรง', 'สแปมหรือโฆษณา', 'โพสต์ซ้ำ'];

export function HideDialog({ st, set, onHide }: {
  st: AppState;
  set: SetState;
  onHide: (id: string, reason: string) => Promise<void>;
}) {
  const id = st.hideFor!;
  const post = findPostIn(st, id);
  const queued = st.modReports.find((r) => r.post_id === id);
  const [reason, setReason] = useState<string | null>(null);
  const [other, setOther] = useState('');
  const [busy, setBusy] = useState(false);
  const trap = useFocusTrap<HTMLDivElement>();
  const close = () => { if (!busy) set({ hideFor: null }); };
  const finalReason = reason === 'อื่น ๆ' ? other.trim() : reason ?? '';

  const submit = async () => {
    if (!finalReason || busy) return;
    setBusy(true);
    await onHide(id, finalReason);
    setBusy(false);
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 43, animation: 'wnm-pop .16s ease both' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={trap} className="dialog" role="dialog" aria-modal="true" aria-labelledby="hide-title" style={{ gap: 12, borderRadius: 20 }}>
        <h4 id="hide-title" className="dialog-title" style={{ margin: 0, fontSize: 16 }}>ซ่อนโพสต์นี้</h4>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, background: 'var(--color-neutral-100)', borderRadius: 12, padding: '9px 12px' }}>
          <strong style={{ display: 'block' }}>{post?.title ?? queued?.title ?? 'โพสต์'}</strong>
          <span style={{ color: 'var(--color-neutral-700)' }}>{post?.name ?? ''}</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>
          <li>โพสต์จะหายจากฟีดและประกาศ แต่ไม่ถูกลบ · กดแสดงอีกครั้งได้ภายหลัง</li>
          {queued && queued.status === 'Open' && <li>รายงาน {queued.tickets.length} รายการจะเปลี่ยนเป็น &ldquo;{REPORT_LABEL.Reviewed}&rdquo; และแจ้งผู้รายงาน</li>}
          <li>เจ้าของโพสต์จะได้รับแจ้งเตือนพร้อมเหตุผลด้านล่าง</li>
        </ul>
        <div role="radiogroup" aria-label="เหตุผลที่ซ่อน" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[...HIDE_REASONS, 'อื่น ๆ'].map((r) => (
            <button key={r} role="radio" aria-checked={reason === r} className="tag" onClick={() => setReason(r)} style={{ ...chipStyle(reason === r), cursor: 'pointer', fontSize: 12, padding: '6px 12px' }}>
              {r}
            </button>
          ))}
        </div>
        {reason === 'อื่น ๆ' && (
          <input className="input" autoFocus maxLength={300} value={other} onChange={(e) => setOther(e.target.value)}
            placeholder="ระบุเหตุผลที่เจ้าของโพสต์จะเห็น" style={{ background: 'var(--color-neutral-100)', fontSize: 13 }} />
        )}
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={close} disabled={busy}>ยกเลิก</button>
          <button className="btn" onClick={submit} disabled={!finalReason || busy}
            style={{ background: 'var(--danger)', color: '#fff', fontWeight: 600 }}>
            {busy ? 'กำลังซ่อน…' : 'ซ่อนโพสต์'}
          </button>
        </div>
      </div>
    </div>
  );
}
