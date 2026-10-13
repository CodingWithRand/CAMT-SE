'use client';

import { useRef, useState, type CSSProperties } from 'react';
import type { AppState, SetState } from '@/lib/state';
import { useApi } from './AuthContext';
import { AnnounceToggle, CatPicker, labelStyle, toggle } from './formParts';

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
let mediaIds = 0;

interface ComposeProps {
  st: AppState;
  set: SetState;
  isMod: boolean;
  meName: string;
  meInitials: string;
  meAvatar: CSSProperties;
  flash: (t: string) => void;
  email: string;
  /** Called after the post is saved, so the feed shows it without reloading the page. */
  onPosted: () => void;
}

export function ComposeDialog({ st, set, isMod, email, meName, meInitials, meAvatar, flash, onPosted }: ComposeProps) {
  const api = useApi();

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
      id: `m${++mediaIds}`, type: 'image' as const, label: file.name, file, url: URL.createObjectURL(file),
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
    // multipart/form-data so the image files travel with the post. No
    // Content-Type header: the browser has to set it, boundary included.
    const form = new FormData();
    form.append('title', title);
    form.append('content', text);
    form.append('is_important', String(imp));
    st.newCats
      .map((c) => st.cats.find((x) => x.name === c)?.id)
      .filter((x): x is string => !!x)
      .forEach((id) => form.append('category_id', id));
    st.newMedia.forEach((m) => form.append('images', m.file, m.file.name));

    setSending(true);
    try {
      const res = await api('/post/create', { method: 'POST', body: form });
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
            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>{isMod ? `ผู้ดูแล · ${email}` : email}</span>
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

        <CatPicker cats={st.cats} selected={st.newCats} onToggle={(name) => set((prev) => ({ newCats: toggle(prev.newCats, name) }))} />

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
