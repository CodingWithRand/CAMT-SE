'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { useApi } from './AuthContext';

const MAX_NAME = 40;
const MAX_DESCRIPTION = 160;

interface Category {
  id: string;
  category_name: string;
  description: string | null;
  priority: number;
  post_count: number;
  follower_count: number;
}

const PRIORITY: { value: number; label: string; hint: string }[] = [
  { value: 1, label: 'สำคัญมาก', hint: 'เช่น แจ้งเตือนความปลอดภัย · ป้ายบนโพสต์เป็นสีเด่น' },
  { value: 2, label: 'สำคัญ', hint: 'เช่น กิจกรรม ถาม-ตอบ · ป้ายบนโพสต์เป็นสีเด่น' },
  { value: 3, label: 'ทั่วไป', hint: 'เรื่องทั่วไป · ป้ายบนโพสต์เป็นสีเรียบ' },
];

/** Same look as the category chips on posts (PostCard): priority 1-2 highlighted. */
const chipLook = (priority: number): CSSProperties => priority <= 2
  ? { background: 'var(--color-accent-100)', color: 'var(--color-accent-800)' }
  : { background: 'var(--color-neutral-200)', color: 'var(--color-neutral-800)' };

const card: CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 18 };
const label: CSSProperties = { fontSize: 11.5, color: 'var(--color-neutral-700)', display: 'flex', justifyContent: 'space-between' };
const field: CSSProperties = { background: 'var(--color-neutral-100)', fontSize: 13.5, borderRadius: 12 };

type Draft = { id: string | null; name: string; description: string; priority: number };
const EMPTY: Draft = { id: null, name: '', description: '', priority: 3 };

export function CategoryManager({ flash, dotFor, revision, onChanged }: {
  flash: (t: string) => void;
  dotFor: (id: string) => string | undefined;
  revision: string;   // changes when categories change anywhere (live update), to refetch
  onChanged: () => void;   // reload the categories used across the page right away
}) {
  const api = useApi();
  const [cats, setCats] = useState<Category[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api('/admin/categories').catch(() => null);
    if (res?.ok) setCats(await res.json());
  }, [api]);

  useEffect(() => { load(); }, [load, revision]);

  const save = async () => {
    if (!draft || busy) return;
    const name = draft.name.trim();
    if (!name) return setError('ตั้งชื่อหมวดหมู่ก่อน');
    setBusy(true);
    setError(null);
    const res = await api(`/admin/categories${draft.id ? `/${draft.id}` : ''}`, {
      method: draft.id ? 'PUT' : 'POST',
      json: { name, description: draft.description, priority: draft.priority },
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      return setError(res?.status === 409 ? 'มีหมวดหมู่ชื่อนี้อยู่แล้ว' : 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    flash(draft.id ? `บันทึกหมวด "${name}" แล้ว` : `เพิ่มหมวด "${name}" แล้ว · ผู้ใช้เลือกใช้ได้ทันที`);
    setDraft(null);
    load();
    onChanged();
  };

  const remove = async (c: Category) => {
    setBusy(true);
    const res = await api(`/admin/categories/${c.id}`, { method: 'DELETE' }).catch(() => null);
    setBusy(false);
    setConfirmDelete(null);
    if (!res?.ok) return flash(res?.status === 409 ? `ลบไม่ได้ · ยังมีโพสต์ในหมวด "${c.category_name}"` : 'ลบไม่สำเร็จ');
    flash(`ลบหมวด "${c.category_name}" แล้ว`);
    load();
    onChanged();
  };

  const editor = draft && (
    <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, borderColor: 'var(--color-accent-300)' }}>
      <strong style={{ fontSize: 14 }}>{draft.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</strong>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={label}><span>ชื่อหมวดหมู่</span><span>{draft.name.length}/{MAX_NAME}</span></span>
        <input className="input" autoFocus maxLength={MAX_NAME} value={draft.name} placeholder="เช่น ทุนการศึกษา"
          onChange={(e) => { setDraft({ ...draft, name: e.target.value }); setError(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setDraft(null); }} style={field} />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={label}><span>คำอธิบาย (ไม่บังคับ)</span><span>{draft.description.length}/{MAX_DESCRIPTION}</span></span>
        <input className="input" maxLength={MAX_DESCRIPTION} value={draft.description} placeholder="หมวดนี้ใช้กับเรื่องแบบไหน"
          onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={field} />
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={label}>ความสำคัญ</span>
        <div role="radiogroup" aria-label="ความสำคัญ" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          {PRIORITY.map((p) => {
            const on = draft.priority === p.value;
            return (
              <button key={p.value} type="button" role="radio" aria-checked={on} onClick={() => setDraft({ ...draft, priority: p.value })}
                style={{ cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', padding: '9px 12px', borderRadius: 12, border: `1.5px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`, background: on ? 'var(--color-accent-100)' : 'var(--color-neutral-100)', color: 'var(--color-text)' }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{p.label}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)', lineHeight: 1.4 }}>{p.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--color-neutral-700)' }}>
        ตัวอย่างบนโพสต์:
        <span className="tag" style={{ ...chipLook(draft.priority), fontSize: 11.5 }}>{draft.name.trim() || 'ชื่อหมวดหมู่'}</span>
      </div>

      {error && <span role="alert" style={{ fontSize: 12.5, color: 'var(--danger-ink)', background: 'var(--danger-soft)', borderRadius: 10, padding: '8px 12px' }}>{error}</span>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn btn-secondary" onClick={() => { setDraft(null); setError(null); }} disabled={busy} style={{ fontFamily: 'var(--font-body)' }}>ยกเลิก</button>
        <button className="btn btn-primary" onClick={save} disabled={busy} style={{ fontFamily: 'var(--font-body)' }}>
          {busy ? 'กำลังบันทึก…' : draft.id ? 'บันทึก' : 'เพิ่มหมวดหมู่'}
        </button>
      </div>
    </div>
  );

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ flex: 1, fontSize: 12.5, color: 'var(--color-neutral-700)' }}>
          {cats ? `${cats.length} หมวดหมู่ · ผู้ใช้เลือกหมวดตอนโพสต์ และกดติดตามเพื่อรับแจ้งเตือนประกาศ` : 'กำลังโหลด…'}
        </span>
        {!draft?.id && !draft && (
          <button className="btn btn-primary" onClick={() => { setDraft(EMPTY); setError(null); }} style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>＋ เพิ่มหมวดหมู่</button>
        )}
      </div>

      {draft && !draft.id && editor}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cats?.map((c) => draft?.id === c.id ? <div key={c.id}>{editor}</div> : (
          <div key={c.id} style={{ ...card, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, flex: 'none', background: dotFor(c.id) ?? 'var(--color-neutral-400)' }} />
              <span className="tag" style={{ ...chipLook(c.priority), fontSize: 12.5, fontWeight: 600 }}>{c.category_name}</span>
              <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>{PRIORITY.find((p) => p.value === c.priority)?.label ?? `ระดับ ${c.priority}`}</span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost" onClick={() => { setDraft({ id: c.id, name: c.category_name, description: c.description ?? '', priority: c.priority }); setError(null); }}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 12.5 }}>แก้ไข</button>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(c.id)} disabled={c.post_count > 0}
                  title={c.post_count > 0 ? `มี ${c.post_count} โพสต์ใช้หมวดนี้อยู่ จึงลบไม่ได้ · เปลี่ยนชื่อแทนได้` : 'ลบหมวดหมู่'}
                  style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--danger-text)' }}>ลบ</button>
              </span>
            </div>
            {c.description && <span style={{ fontSize: 12.5, color: 'var(--color-neutral-800)' }}>{c.description}</span>}
            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>
              {c.post_count} โพสต์ · {c.follower_count} คนติดตาม
              {c.post_count > 0 && ' · ลบไม่ได้เพราะยังมีโพสต์'}
            </span>
            {confirmDelete === c.id && (
              <div role="alertdialog" aria-label={`ยืนยันการลบ ${c.category_name}`} style={{ background: 'var(--danger-soft)', color: 'var(--danger-ink)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ flex: 1, fontSize: 12.5 }}>
                  ลบหมวด &ldquo;{c.category_name}&rdquo;?{c.follower_count > 0 && ` ผู้ติดตาม ${c.follower_count} คนจะไม่ได้รับแจ้งเตือนหมวดนี้อีก`}
                </span>
                <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)} disabled={busy} style={{ fontFamily: 'var(--font-body)', fontSize: 12.5 }}>ยกเลิก</button>
                <button className="btn" onClick={() => remove(c)} disabled={busy} autoFocus style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, background: 'var(--danger)', color: '#fff' }}>ลบหมวดหมู่</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
