'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { avatarStyle } from '@/lib/ui';
import { SearchIcon, ShieldIcon } from './AuthIcons';

const API_URL = "http://localhost:3030";

interface Member {
  id: string;
  display_name: string;
  email: string;
  is_mod: boolean;
  is_cmu_p: boolean;   // CMU staff; the database only lets staff be moderators
  created_at: string;
}

const MOD_POWERS = [
  'ดูรายงานทั้งหมด และตัดสินว่าจะทำอะไรกับโพสต์',
  'แก้ไข ซ่อน และลบโพสต์ของทุกคน',
  'เผยแพร่ประกาศ และจัดการหมวดหมู่',
  'มอบหรือถอนสิทธิ์ผู้ดูแลของคนอื่น',
];

const card: CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 18 };

export function RoleManager({ authHeaders, flash, myId, revision }: {
  authHeaders: (extra?: Record<string, string>) => Record<string, string>;
  flash: (t: string) => void;
  myId: string | null;
  revision: number;   // bumps on live "roles" hints, to refetch
}) {
  const [q, setQ] = useState('');
  const [onlyMods, setOnlyMods] = useState(false);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (query: string) => {
    const res = await fetch(`${API_URL}/admin/users?q=${encodeURIComponent(query)}`, { headers: authHeaders() }).catch(() => null);
    if (res?.ok) setMembers(await res.json());
  }, [authHeaders]);

  // Search as you type, after a short pause.
  useEffect(() => {
    const t = setTimeout(() => load(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q, load, revision]);

  const modCount = members?.filter((m) => m.is_mod).length ?? 0;
  const shown = (members ?? []).filter((m) => !onlyMods || m.is_mod);

  const setRole = async (m: Member, isMod: boolean) => {
    setBusy(true);
    const res = await fetch(`${API_URL}/admin/users/${m.id}/role`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ is_mod: isMod }),
    }).catch(() => null);
    setBusy(false);
    setConfirm(null);
    if (!res?.ok) {
      const body = await res?.json().catch(() => null);
      return flash(body?.code === 'not_staff' ? 'ตั้งได้เฉพาะบุคลากร มช.'
        : res?.status === 409 ? 'ต้องมีผู้ดูแลอย่างน้อย 1 คน' : body?.message ?? 'เปลี่ยนสิทธิ์ไม่สำเร็จ');
    }
    flash(isMod ? `${m.display_name} เป็นผู้ดูแลแล้ว` : `ถอนสิทธิ์ผู้ดูแลของ ${m.display_name} แล้ว`);
    load(q.trim());
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...card, padding: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="topbar-search" style={{ flex: '1 1 240px', width: 'auto', justifySelf: 'stretch', minHeight: 40 }}>
          <SearchIcon />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาด้วยชื่อหรืออีเมล" aria-label="ค้นหาผู้ใช้" />
        </label>
        <div className="mod-tabs" role="tablist" aria-label="กรองผู้ใช้" style={{ flex: 'none' }}>
          <button role="tab" aria-selected={!onlyMods} onClick={() => setOnlyMods(false)}>ทุกคน</button>
          <button role="tab" aria-selected={onlyMods} onClick={() => setOnlyMods(true)}>ผู้ดูแล <span className="mod-count">{modCount}</span></button>
        </div>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {members === null && <div style={{ padding: 24, fontSize: 13, color: 'var(--color-neutral-600)' }}>กำลังโหลด…</div>}
        {members && shown.length === 0 && <div style={{ padding: 24, fontSize: 13, color: 'var(--color-neutral-600)' }}>ไม่พบผู้ใช้ที่ตรงกับคำค้น</div>}
        {shown.map((m, i) => {
          const self = m.id === myId;
          return (
            <div key={m.id} style={{ padding: '12px 14px', borderTop: i ? '1px solid var(--color-divider)' : 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
                <span style={avatarStyle(i % 6, 36)}>{m.display_name.slice(0, 2)}</span>
                <span style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 13.5, fontWeight: 600 }}>
                    {m.display_name}
                    {m.is_mod && (
                      <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-accent-200)', color: 'var(--color-accent-800)', fontSize: 10.5, fontWeight: 700 }}>
                        <ShieldIcon /> ผู้ดูแล
                      </span>
                    )}
                    {m.is_cmu_p && !m.is_mod && <span className="tag" style={{ background: '#e4efd2', color: '#33401f', fontSize: 10.5 }}>บุคลากร มช.</span>}
                    {self && <span className="tag" style={{ background: 'var(--color-neutral-200)', color: 'var(--color-neutral-800)', fontSize: 10.5 }}>คุณ</span>}
                  </span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'var(--color-neutral-600)', overflowWrap: 'anywhere' }}>{m.email}</span>
                </span>
                {!self && !m.is_mod && !m.is_cmu_p && (
                  <span title="ระบบกำหนดให้เฉพาะบุคลากร มช. เป็นผู้ดูแลได้" style={{ flex: 'none', fontSize: 11.5, color: 'var(--color-neutral-600)', padding: '6px 10px', borderRadius: 999, background: 'var(--color-neutral-100)' }}>
                    ต้องเป็นบุคลากร มช.
                  </span>
                )}
                {!self && (m.is_mod || m.is_cmu_p) && (
                  <button className="btn" onClick={() => setConfirm(confirm === m.id ? null : m.id)} disabled={busy}
                    style={{ flex: 'none', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, border: '1px solid',
                      ...(m.is_mod
                        ? { background: 'transparent', color: '#8a3a1c', borderColor: '#e7b3a0' }
                        : { background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', borderColor: 'var(--color-accent-300)' }) }}>
                    {m.is_mod ? 'ถอนสิทธิ์ผู้ดูแล' : 'ตั้งเป็นผู้ดูแล'}
                  </button>
                )}
              </div>

              {confirm === m.id && (
                <div role="alertdialog" aria-label="ยืนยันการเปลี่ยนสิทธิ์" style={{ borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: m.is_mod ? '#f8ddd3' : 'var(--color-accent-100)', color: m.is_mod ? '#6f2f14' : 'var(--color-accent-900)' }}>
                  <strong style={{ fontSize: 13 }}>
                    {m.is_mod ? `ถอนสิทธิ์ผู้ดูแลของ ${m.display_name}?` : `ตั้ง ${m.display_name} เป็นผู้ดูแล?`}
                  </strong>
                  <span style={{ fontSize: 12 }}>{m.is_mod ? 'จะกลับเป็นสมาชิกทั่วไป และทำสิ่งเหล่านี้ไม่ได้อีก:' : 'ผู้ดูแลจะทำสิ่งเหล่านี้ได้:'}</span>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.6 }}>
                    {MOD_POWERS.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => setConfirm(null)} disabled={busy} style={{ fontFamily: 'var(--font-body)', fontSize: 12.5 }}>ยกเลิก</button>
                    <button className="btn" onClick={() => setRole(m, !m.is_mod)} disabled={busy} autoFocus
                      style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: '#fff', background: m.is_mod ? '#a2391c' : 'var(--color-accent)' }}>
                      {busy ? 'กำลังบันทึก…' : m.is_mod ? 'ถอนสิทธิ์' : 'ตั้งเป็นผู้ดูแล'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', padding: '0 4px' }}>
        ตั้งเป็นผู้ดูแลได้เฉพาะบุคลากร มช. · เปลี่ยนสิทธิ์ของตัวเองไม่ได้ และต้องมีผู้ดูแลอย่างน้อย 1 คนเสมอ · คนที่ถูกเปลี่ยนสิทธิ์จะเห็นผลทันทีโดยไม่ต้อง login ใหม่
      </span>
    </section>
  );
}
