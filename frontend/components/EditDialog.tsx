'use client';

import { useState } from 'react';
import type { Post, ReportStatus } from '@/lib/data';
import { findPostIn, mapAllPosts, type AppState, type SetState } from '@/lib/state';
import { REPORT_LABEL, statusLook } from '@/lib/ui';
import { useApi } from './AuthContext';
import { AnnounceToggle, CatPicker, labelStyle, toggle } from './formParts';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface EditProps {
  st: AppState;
  set: SetState;
  flash: (t: string) => void;
  setStatus: (id: string, s: ReportStatus) => void;
  isMod: boolean;
  onHide: (id: string) => void;
  onUnhide: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EditDialog({ st, set, flash, setStatus, isMod, onHide, onUnhide, onDelete }: EditProps) {
  const api = useApi();
  const id = st.editFor!;
  const post = findPostIn(st, id);
  const mine = !!post?.mine;
  const asMod = isMod && !mine;   // a moderator editing someone else's post
  const status = st.reportStatus[id];
  const reason = st.reportReason[id];
  const [busy, setBusy] = useState(false);
  const trap = useFocusTrap<HTMLDivElement>();
  const close = () => { if (!busy) set({ editFor: null }); };

  const save = async () => {
    const title = st.editTitle.trim();
    if (!title) return flash('หัวเรื่องต้องไม่ว่าง');
    if (!st.editCats.length) return flash('ต้องเลือกหมวดหมู่อย่างน้อย 1 หมวด');

    setBusy(true);
    const body = st.editBody.trim();
    const res = await api(`/post/${id}/edit`, {
      method: 'PUT',
      json: { title, content: body, is_important: st.editImportant, category_names: st.editCats },
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      return flash(res?.status === 403 ? 'แก้ไขได้เฉพาะโพสต์ของคุณ' : 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
    }

    set((prev) => {
      // Only a moderator can switch a post to or from an announcement; the API ignores it otherwise.
      const important = isMod ? prev.editImportant : undefined;
      const edit = (list: Post[]) => list.map((p) => (p.id === id ? {
        ...p, title, body, cats: prev.editCats,
        ...(important === undefined ? {} : { important, priority: important ? p.priority : null }),
        edited: asMod ? 'แก้ไขโดยผู้ดูแล' : 'แก้ไขแล้ว',
      } : p));
      return { editFor: null, ...mapAllPosts(prev, edit) };
    });
    // A moderator editing a reported post is how it gets fixed, so that closes its open reports.
    // An author editing their own reported post does not.
    if (isMod && st.reportStatus[id] === 'Open') setStatus(id, 'Reviewed');
    else flash('บันทึกการแก้ไขแล้ว');
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 42, animation: 'wnm-pop .16s ease both' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={trap} className="dialog" role="dialog" aria-modal="true" aria-labelledby="edit-title" style={{ width: 'min(560px,100%)', maxHeight: '92vh', overflow: 'auto', gap: 13, borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h4 id="edit-title" className="dialog-title" style={{ margin: 0, flex: 1, fontSize: 16 }}>{asMod ? 'แก้ไขโพสต์ (ผู้ดูแล)' : 'แก้ไขโพสต์ของคุณ'}</h4>
          <button className="btn btn-secondary btn-icon" onClick={close} aria-label="ปิด">✕</button>
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--color-neutral-700)' }}>
          {asMod
            ? `โพสต์ของ ${post?.name ?? ''} · โพสต์จะขึ้นป้าย "แก้ไขโดยผู้ดูแล"`
            : 'โพสต์จะขึ้นป้าย "แก้ไขแล้ว" ให้ผู้อ่านทราบ'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>หัวเรื่อง</label>
          <input className="input" maxLength={120} value={st.editTitle} onChange={(e) => set({ editTitle: e.target.value })} style={{ background: 'var(--color-neutral-100)', fontSize: 13.5 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>เนื้อหา</label>
          <textarea className="input" maxLength={5000} value={st.editBody} onChange={(e) => set({ editBody: e.target.value })} style={{ borderRadius: 16, minHeight: 120, background: 'var(--color-neutral-100)', fontSize: 13.5 }} />
        </div>

        <CatPicker cats={st.cats} selected={st.editCats} onToggle={(name) => set((prev) => ({ editCats: toggle(prev.editCats, name) }))} />

        {isMod && status && (() => {
          const [bg, fg] = statusLook(status);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--peach)', borderRadius: 14, padding: '12px 14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                สถานะรายงาน
                <span className="tag" style={{ background: bg, color: fg, fontWeight: 700 }}>{REPORT_LABEL[status]}</span>
              </span>
              {reason && <span style={{ fontSize: 11.5, color: 'var(--color-neutral-800)' }}>เหตุผลล่าสุด: {reason}</span>}
              <span style={{ fontSize: 11, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
                {status === 'Open'
                  ? `กดบันทึกแล้ว รายงานจะเปลี่ยนเป็น "${REPORT_LABEL.Reviewed}" และแจ้งผู้รายงาน · เปลี่ยนสถานะอื่นได้ที่ศูนย์ผู้ดูแล`
                  : 'เปลี่ยนสถานะได้ที่ศูนย์ผู้ดูแล'}
              </span>
            </div>
          );
        })()}

        {isMod && (
          <AnnounceToggle
            note={st.editImportant ? 'แสดงในเลนประกาศและส่งแจ้งเตือน' : 'แสดงเป็นโพสต์ทั่วไป'}
            on={st.editImportant}
            onToggle={() => set((prev) => ({ editImportant: !prev.editImportant }))}
          />
        )}

        <div className="dialog-actions" style={{ flexWrap: 'wrap' }}>
          <span style={{ marginRight: 'auto', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {mine ? (
              <button className="btn btn-ghost" onClick={() => onDelete(id)} disabled={busy} style={{ color: 'var(--danger-text)' }}>ลบโพสต์</button>
            ) : isMod && (
              <>
                {post?.hidden
                  ? <button className="btn btn-ghost" onClick={() => onUnhide(id)} disabled={busy}>แสดงโพสต์อีกครั้ง</button>
                  : <button className="btn btn-ghost" onClick={() => onHide(id)} disabled={busy} style={{ color: 'var(--danger-text)' }}>ซ่อนโพสต์</button>}
                <button className="btn btn-ghost" onClick={() => onDelete(id)} disabled={busy} style={{ color: 'var(--danger-text)' }}>ลบถาวร</button>
              </>
            )}
          </span>
          <button className="btn btn-secondary" onClick={close} disabled={busy}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'กำลังบันทึก…' : 'บันทึก'}</button>
        </div>
      </div>
    </div>
  );
}
