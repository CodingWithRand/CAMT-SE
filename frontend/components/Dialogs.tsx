'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { CATS, ME, REASONS, STATUSES, type Post, type ReportStatus } from '@/lib/data';
import { chipStyle, statusLook } from '@/lib/ui';
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
}

export function ComposeDialog({ st, set, isMod, meName, meInitials, meAvatar, flash, nextPostId, nextMediaId }: ComposeProps) {
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
    // console.log(res.status)
    // console.log(await res.json())
    // set((prev) => ({ posts: [np, ...prev.posts], composeOpen: false, newTitle: '', newText: '', newCats: [], newMedia: [], newImportant: false }));
    flash(imp ? 'เผยแพร่เป็นประกาศและส่งแจ้งเตือนแล้ว' : 'เผยแพร่โพสต์แล้ว');
    setTimeout(() => window.location.reload(), 1000); // <== find a better way to refresh after posted.
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
}

export function EditDialog({ st, set, flash, setStatus }: EditProps) {
  const { user, session } = useAuthContext();
  const id = st.editFor!;
  const post = st.posts.find((p) => p.id === id);
  const status = st.reportStatus[id];
  const reason = st.reportReason[id];
  const close = () => set({ editFor: null });

  const save = () => {
    const title = st.editTitle.trim();
    if (!title) return flash('หัวเรื่องต้องไม่ว่าง');
    if (!st.editCats.length) return flash('ต้องเลือกหมวดหมู่อย่างน้อย 1 หมวด');

    set((prev) => {
      fetch(`${API_URL}/post/${id}/edit`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          title,
          content: prev.editBody.trim(),
          is_important: prev.editImportant,
          category_names: prev.editCats
        })
      }).then(() => {
        console.log('jhi')        
      }).catch(err => console.error(err));
      return {
        editFor: null,
        posts: prev.posts.map((p) => (p.id === id ? {
          ...p, title, body: prev.editBody.trim(),
          cats: prev.editCats, important: prev.editImportant,
          priority: prev.editImportant ? p.priority : null,
          edited: 'แก้ไขโดยผู้ดูแล',
        } : p)),
      }
    });
    flash('บันทึกการแก้ไขแล้ว');
  };

  const remove = async () => {
    console.log(id);
    await fetch(`${API_URL}/post/${id}/delete`, { 
      method: 'DELETE', 
      headers: { Authorization: `Bearer ${session.access_token}` 
    } });
    // /post/:pid/delete
    set((prev) => ({ editFor: null, activeId: prev.activeId === id ? null : prev.activeId, posts: prev.posts.filter((p) => p.id !== id) }));
    flash('ลบโพสต์แล้ว');
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 42, animation: 'wnm-pop .16s ease both' }}>
      <div className="dialog" style={{ width: 'min(560px,100%)', maxHeight: '92vh', overflow: 'auto', gap: 13, borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h4 className="dialog-title" style={{ margin: 0, flex: 1, fontSize: 16 }}>แก้ไขโพสต์ (ผู้ดูแล)</h4>
          <button className="btn btn-secondary btn-icon" onClick={close}>✕</button>
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--color-neutral-700)' }}>
          โพสต์ของ {post?.name ?? ''} · การแก้ไขจะบันทึกผู้แก้ไขและเวลาไว้กับโพสต์
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

        {status && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, background: 'var(--peach)', borderRadius: 14, padding: '12px 14px' }}>
            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-800)' }}>
              สถานะรายงานปัจจุบัน: {status}{reason ? ` · ${reason}` : ''}
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUSES.map((x) => {
                const on = status === x;
                const [bg, fg] = statusLook(x);
                return (
                  <button key={x} className="hov-border" onClick={() => setStatus(id, x)} style={{ cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${on ? 'var(--color-accent)' : 'transparent'}`, background: on ? bg : 'var(--color-surface)', color: on ? fg : 'var(--color-neutral-800)' }}>
                    {x}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <AnnounceToggle
          note={st.editImportant ? 'แสดงในเลนประกาศและส่งแจ้งเตือน' : 'แสดงเป็นโพสต์ทั่วไป'}
          on={st.editImportant}
          onToggle={() => set((prev) => ({ editImportant: !prev.editImportant }))}
        />

        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={remove} style={{ marginRight: 'auto', color: '#8a3a1c' }}>ลบโพสต์</button>
          <button className="btn btn-secondary" onClick={close}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={save}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}

/* ── Report ── */

export function ReportDialog({ st, set, flash }: { st: AppState; set: SetState; flash: (t: string) => void }) {
  const id = st.reportFor!;
  const close = () => set({ reportFor: null, reason: null });
  const submit = () => {
    set((prev) => ({
      reportFor: null, reason: null,
      reportStatus: { ...prev.reportStatus, [id]: prev.reportStatus[id] || 'Open' },
      reportReason: { ...prev.reportReason, [id]: prev.reason! },
      posts: prev.posts.map((p) => (p.id === id ? { ...p, reports: (p.reports || 0) + 1 } : p)),
    }));
    flash('บันทึกรายงานแล้ว · สถานะ Open รอผู้ดูแลตรวจสอบ');
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 41, animation: 'wnm-pop .16s ease both' }}>
      <div className="dialog" style={{ gap: 12, borderRadius: 20 }}>
        <h4 className="dialog-title" style={{ margin: 0, fontSize: 16 }}>รายงานโพสต์นี้</h4>
        <p className="dialog-body" style={{ margin: 0, fontSize: 13 }}>
          รายงานจะถูกบันทึกด้วยสถานะเริ่มต้น Open และแสดงบนโพสต์ให้ทุกคนเห็น มีเพียงผู้ดูแล (isMod) ที่เปลี่ยนสถานะเป็น Reviewed หรือ Dismissed ได้
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {REASONS.map((r) => {
            const on = st.reason === r;
            return (
              <button key={r} className="hov-border" onClick={() => set({ reason: r })} style={{ cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 13, padding: '11px 15px', borderRadius: 999, background: on ? 'var(--color-accent-100)' : 'var(--color-neutral-100)', border: `1.5px solid ${on ? 'var(--color-accent)' : 'transparent'}`, color: 'var(--color-text)' }}>
                {r}
              </button>
            );
          })}
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={close}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={submit} disabled={!st.reason}>ส่งรายงาน</button>
        </div>
      </div>
    </div>
  );
}
