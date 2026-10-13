'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { CATS, ME, REASONS, type Post, type ReportStatus } from '@/lib/data';
import { REPORT_LABEL, chipStyle, statusLook } from '@/lib/ui';
import type { AppState, SetState } from './WhongNaiMor';
import { useAuthContext } from './AuthContext';

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

const labelStyle: CSSProperties = { fontSize: 11.5, color: 'var(--color-neutral-700)' };
const knobStyle: CSSProperties = { width: 21, height: 21, borderRadius: 999, background: '#fff', display: 'block' };
const trackStyle = (on: boolean, enabled = true): CSSProperties => ({
  cursor: enabled ? 'pointer' : 'not-allowed', border: 0, width: 48, height: 27, borderRadius: 999, padding: 3,
  display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
  background: on ? 'var(--color-accent)' : 'var(--color-neutral-300)', opacity: enabled ? 1 : 0.45,
});

const API_URL = "http://localhost:3030";
const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 50 * 1024 * 1024;

function CatPicker({ cats, selected, onToggle }: { cats: typeof CATS, selected: string[]; onToggle: (name: string) => void }) {
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

function AnnounceToggle({ note, on, enabled, onToggle }: { note: string; on: boolean; enabled?: boolean; onToggle: () => void }) {
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

/* ── Compose ── */

interface ComposeProps {
  st: AppState;
  set: SetState;
  isMod: boolean;
  meName: string;
  meInitials: string;
  meAvatar: CSSProperties;
  flash: (t: string) => void;
  nextPostId: () => string;
  nextMediaId: () => string;
  /** Called after the post is saved, so the feed shows it without reloading the page. */
  onPosted: () => void;
}

export function ComposeDialog({ st, set, isMod, meName, meInitials, meAvatar, flash, nextPostId, nextMediaId, onPosted }: ComposeProps) {
  const { user, session } = useAuthContext();

  const filePicker = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);

  const close = () => set({ composeOpen: false });

  // Same caps the API enforces (multer: 10 images, 50 MB each), checked here so
  // the user hears about it before waiting on an upload that would be rejected.
  const addImages = (picked: File[]) => {
    const images = picked.filter((f) => f.type.startsWith('image/'));
    if (images.length < picked.length) flash('แนบได้เฉพาะไฟล์รูปภาพ');
    const fits = images.filter((f) => f.size <= MAX_IMAGE_BYTES);
    if (fits.length < images.length) flash('รูปภาพต้องมีขนาดไม่เกิน 50 MB ต่อไฟล์');
    const room = MAX_IMAGES - st.newMedia.length;
    if (fits.length > room) flash(`แนบรูปได้สูงสุด ${MAX_IMAGES} รูปต่อโพสต์`);
    const added = fits.slice(0, Math.max(room, 0)).map((file) => ({
      id: nextMediaId(), type: 'image' as const, label: file.name, file, url: URL.createObjectURL(file),
    }));
    if (added.length) set((prev) => ({ newMedia: [...prev.newMedia, ...added] }));
  };

  const removeMedia = (id: string) => set((prev) => {
    const gone = prev.newMedia.find((x) => x.id === id);
    if (gone) URL.revokeObjectURL(gone.url);
    return { newMedia: prev.newMedia.filter((x) => x.id !== id) };
  });

  const submit = async () => {
    const title = st.newTitle.trim();
    const text = st.newText.trim();
    if (!title) return flash('ยังไม่ได้ใส่หัวเรื่อง');
    if (!text) return flash('ยังไม่มีเนื้อหาโพสต์');
    if (!st.newCats.length) return flash('ต้องเลือกหมวดหมู่อย่างน้อย 1 หมวด');
    const imp = st.newImportant && isMod;
    // const np: Post = {
    //   id: nextPostId(), important: imp, type: 'story', priority: null,
    //   role: isMod ? 'mod' : 'student', name: ME.name,
    //   meta: isMod ? 'บุคลากร · ผู้ดูแล' : 'Software Engineering ปี 3',
    //   time: 'เมื่อสักครู่', initials: ME.initials, tint: ME.tint,
    //   title, body: text,
    //   media: st.newMedia.map((m) => ({ type: m.type, label: m.label })),
    //   cats: st.newCats, likes: 0,
    //   notified: imp ? 1204 : 0,
    // };
    // console.log(st.newCats.map((c) => st.CATS.find((x) => x.name === c)?.id).filter((x): x is string => !!x));
    // multipart/form-data so the image files travel with the post. No
    // Content-Type header: the browser has to set it, boundary included.
    const form = new FormData();
    form.append('title', title);
    form.append('content', text);
    form.append('is_important', String(imp));
    st.newCats
      .map((c) => st.CATS.find((x) => x.name === c)?.id)
      .filter((x): x is string => !!x)
      .forEach((id) => form.append('category_id', id));
    st.newMedia.forEach((m) => form.append('images', m.file, m.file.name));

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/post/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('create post', err);
      setSending(false);
      return flash('เผยแพร่โพสต์ไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    st.newMedia.forEach((m) => URL.revokeObjectURL(m.url));
    setSending(false);
    set({ composeOpen: false, newTitle: '', newText: '', newCats: [], newMedia: [], newImportant: false });
    flash(imp ? 'เผยแพร่เป็นประกาศและส่งแจ้งเตือนแล้ว' : 'เผยแพร่โพสต์แล้ว');
    onPosted();
  };

  const importantNote = isMod
    ? (st.newImportant ? 'จะเผยแพร่เป็นประกาศ และส่งแจ้งเตือนให้ผู้ที่สนใจหมวดนี้' : 'ปิดอยู่ · เผยแพร่เป็นโพสต์ทั่วไป')
    : 'เฉพาะบุคลากรและผู้ดูแลเท่านั้นที่ตั้งค่านี้ได้';

  return (
    <div className="dialog-backdrop" style={{ zIndex: 40, animation: 'wnm-pop .16s ease both' }}>
      <div className="dialog" style={{ width: 'min(560px,100%)', maxHeight: '92vh', overflow: 'auto', gap: 13, borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h4 className="dialog-title" style={{ margin: 0, flex: 1, fontSize: 16 }}>เขียนโพสต์ใหม่</h4>
          <button className="btn btn-secondary btn-icon" onClick={close}>✕</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={meAvatar}>{meInitials}</span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>{meName}</span>
            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>{isMod ? 'บุคลากร · ผู้ดูแล (isCMUP = True, isMod = True)' : ME.meta}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>หัวเรื่อง · title</label>
          <input
            className="input"
            value={st.newTitle}
            onChange={(e) => set({ newTitle: e.target.value })}
            maxLength={90}
            placeholder="สรุปเรื่องนี้สั้น ๆ ใน 1 บรรทัด"
            style={{ background: 'var(--color-neutral-100)', fontSize: 13.5 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>เนื้อหา · body</label>
          <textarea
            className="input"
            value={st.newText}
            onChange={(e) => set({ newText: e.target.value })}
            placeholder="เล่ารายละเอียดให้คนอ่านเข้าใจบริบท…"
            style={{ borderRadius: 16, minHeight: 110, background: 'var(--color-neutral-100)', fontSize: 13.5 }}
          />
        </div>

        <CatPicker cats={st.CATS} selected={st.newCats} onToggle={(name) => set((prev) => ({ newCats: toggle(prev.newCats, name) }))} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <label style={{ ...labelStyle, flex: 1 }}>รูปภาพประกอบ · แนบได้สูงสุด {MAX_IMAGES} รูป</label>
            <span style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>{st.newMedia.length ? `${st.newMedia.length} ไฟล์` : 'ยังไม่มีไฟล์'}</span>
          </div>

          {st.newMedia.length > 0 && (
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill,minmax(112px,1fr))' }}>
              {st.newMedia.map((m) => (
                <div key={m.id} title={m.label} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#e5ccf3', border: '1px solid var(--color-divider)', height: 84 }}>
                  <img src={m.url} alt={m.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => removeMedia(m.id)}
                    title="ลบไฟล์นี้"
                    style={{ position: 'absolute', top: 5, right: 5, cursor: 'pointer', border: 0, width: 20, height: 20, borderRadius: 999, background: 'rgba(62,34,89,.78)', color: '#fff', fontSize: 11, lineHeight: 1, display: 'grid', placeItems: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              ref={filePicker}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                addImages(Array.from(e.target.files ?? []));
                e.target.value = ''; // so picking the same file again still fires onChange
              }}
            />
            <button className="hov-border" onClick={() => filePicker.current?.click()} disabled={st.newMedia.length >= MAX_IMAGES} style={{ cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, padding: '9px 15px', borderRadius: 999, border: '1.5px dashed var(--color-divider)', background: 'transparent', color: 'var(--color-text)' }}>
              + เพิ่มรูปภาพ
            </button>
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>แต่ละไฟล์เก็บเป็นระเบียน Media หนึ่งแถว (FileURL, MediaType) ผูกกับโพสต์นี้</span>
        </div>

        <AnnounceToggle
          note={importantNote}
          on={st.newImportant}
          enabled={isMod}
          onToggle={() => (isMod ? set({ newImportant: !st.newImportant }) : flash('ต้องเป็นบุคลากรหรือผู้ดูแลจึงเผยแพร่เป็นประกาศได้'))}
        />

        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={close}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={submit} disabled={sending}>{sending ? 'กำลังเผยแพร่…' : 'เผยแพร่'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Moderator edit ── */

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
  const { session } = useAuthContext();
  const id = st.editFor!;
  const post = [...st.posts, ...st.announce, ...st.extraPosts].find((p) => p.id === id);
  const mine = !!post?.mine;
  const asMod = isMod && !mine;   // a moderator editing someone else's post
  const status = st.reportStatus[id];
  const reason = st.reportReason[id];
  const [busy, setBusy] = useState(false);
  const close = () => { if (!busy) set({ editFor: null }); };

  const save = async () => {
    const title = st.editTitle.trim();
    if (!title) return flash('หัวเรื่องต้องไม่ว่าง');
    if (!st.editCats.length) return flash('ต้องเลือกหมวดหมู่อย่างน้อย 1 หมวด');

    setBusy(true);
    const body = st.editBody.trim();
    const res = await fetch(`${API_URL}/post/${id}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ title, content: body, is_important: st.editImportant, category_names: st.editCats }),
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
      return { editFor: null, posts: edit(prev.posts), announce: edit(prev.announce), extraPosts: edit(prev.extraPosts) };
    });
    // A moderator editing a reported post is how it gets fixed, so that closes its open reports.
    // An author editing their own reported post does not.
    if (isMod && st.reportStatus[id] === 'Open') setStatus(id, 'Reviewed');
    else flash('บันทึกการแก้ไขแล้ว');
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 42, animation: 'wnm-pop .16s ease both' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="edit-title" style={{ width: 'min(560px,100%)', maxHeight: '92vh', overflow: 'auto', gap: 13, borderRadius: 20 }}>
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
          <input className="input" value={st.editTitle} onChange={(e) => set({ editTitle: e.target.value })} style={{ background: 'var(--color-neutral-100)', fontSize: 13.5 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>เนื้อหา</label>
          <textarea className="input" value={st.editBody} onChange={(e) => set({ editBody: e.target.value })} style={{ borderRadius: 16, minHeight: 120, background: 'var(--color-neutral-100)', fontSize: 13.5 }} />
        </div>

        <CatPicker cats={st.CATS} selected={st.editCats} onToggle={(name) => set((prev) => ({ editCats: toggle(prev.editCats, name) }))} />

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
              <button className="btn btn-ghost" onClick={() => onDelete(id)} disabled={busy} style={{ color: '#8a3a1c' }}>ลบโพสต์</button>
            ) : isMod && (
              <>
                {post?.hidden
                  ? <button className="btn btn-ghost" onClick={() => onUnhide(id)} disabled={busy}>แสดงโพสต์อีกครั้ง</button>
                  : <button className="btn btn-ghost" onClick={() => onHide(id)} disabled={busy} style={{ color: '#8a3a1c' }}>ซ่อนโพสต์</button>}
                <button className="btn btn-ghost" onClick={() => onDelete(id)} disabled={busy} style={{ color: '#8a3a1c' }}>ลบถาวร</button>
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

/* ── Delete ── */

export function DeleteDialog({ st, set, isMod, onDelete }: {
  st: AppState;
  set: SetState;
  isMod: boolean;
  onDelete: (id: string) => Promise<void>;
}) {
  const id = st.deleteFor!;
  const post = [...st.posts, ...st.announce, ...st.extraPosts].find((p) => p.id === id);
  const mine = !!post?.mine;
  const [busy, setBusy] = useState(false);
  const close = () => { if (!busy) set({ deleteFor: null }); };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 44, animation: 'wnm-pop .16s ease both' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" style={{ gap: 12, borderRadius: 20 }}>
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
            style={{ background: '#a2391c', color: '#fff', fontWeight: 600 }}>
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
  const post = [...st.posts, ...st.announce, ...st.extraPosts].find((p) => p.id === id);
  const queued = st.modReports.find((r) => r.post_id === id);
  const [reason, setReason] = useState<string | null>(null);
  const [other, setOther] = useState('');
  const [busy, setBusy] = useState(false);
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
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="hide-title" style={{ gap: 12, borderRadius: 20 }}>
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
            style={{ background: '#a2391c', color: '#fff', fontWeight: 600 }}>
            {busy ? 'กำลังซ่อน…' : 'ซ่อนโพสต์'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Report ── */

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
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="report-title" style={{ gap: 12, borderRadius: 20 }}>
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
