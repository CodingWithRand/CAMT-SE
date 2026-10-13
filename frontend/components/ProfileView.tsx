'use client';

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { Category, Post, ReportStatus } from '@/lib/data';
import { REPORT_LABEL, fullDate, statusLook, timeAgo } from '@/lib/ui';
import { useApi } from './AuthContext';
import { ShieldIcon } from './AuthIcons';

interface MyReport {
  id: string;
  post_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  title: string | null;
  post_deleted: boolean;
}

type Tab = 'posts' | 'reports' | 'interests';

const card: CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 18 };
const empty: CSSProperties = { ...card, padding: '26px 18px', textAlign: 'center', fontSize: 13, color: 'var(--color-neutral-600)' };

/** "โปรไฟล์ของฉัน": display name, own posts, reports sent with their status, followed categories. */
export function ProfileView({ name, email, isMod, avatar, initials, posts, cats, interests, revision, renderPost, flash, onRenamed, onOpenPost, onEditInterests }: {
  name: string;
  email: string;
  isMod: boolean;
  avatar: CSSProperties;
  initials: string;
  posts: Post[] | null;              // own posts, from page state (so edits, reactions and deletes show at once)
  cats: Category[];
  interests: string[];
  revision: number;                  // bumps on live "reports" hints, to refetch the report list
  renderPost: (p: Post) => ReactNode;
  flash: (t: string) => void;
  onRenamed: () => void;
  onOpenPost: (id: string) => void;
  onEditInterests: () => void;
}) {
  const api = useApi();
  const [tab, setTab] = useState<Tab>('posts');
  const [reports, setReports] = useState<MyReport[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadReports = useCallback(async () => {
    const res = await api('/report/mine').catch(() => null);
    if (res?.ok) setReports(await res.json());
  }, [api]);
  useEffect(() => { loadReports(); }, [loadReports, revision]);

  const rename = async () => {
    const next = (editing ?? '').trim().replace(/\s+/g, ' ');
    if (next.length < 2 || next.length > 50) return flash('ชื่อที่แสดงต้องยาว 2–50 ตัวอักษร');
    if (next === name) return setEditing(null);
    setBusy(true);
    const res = await api('/user/me', { method: 'PUT', json: { display_name: next } }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return flash('เปลี่ยนชื่อไม่สำเร็จ ลองใหม่อีกครั้ง');
    setEditing(null);
    flash('เปลี่ยนชื่อที่แสดงแล้ว · โพสต์และความเห็นทั้งหมดจะใช้ชื่อใหม่');
    onRenamed();
  };

  const openReports = reports?.filter((r) => r.status === 'Open').length ?? 0;
  const TABS: [Tab, string, number | null][] = [
    ['posts', 'โพสต์ของฉัน', posts?.length ?? null],
    ['reports', 'รายงานที่ส่ง', reports?.length ?? null],
    ['interests', 'หมวดที่ติดตาม', interests.length],
  ];

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      <section style={{ ...card, padding: 18, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ ...avatar, width: 64, height: 64, fontSize: 21 }}>{initials}</span>
        <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {editing === null ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{name}</h3>
              {isMod && (
                <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-accent-200)', color: 'var(--color-accent-800)', fontSize: 10.5, fontWeight: 700 }}>
                  <ShieldIcon /> ผู้ดูแล
                </span>
              )}
              <button className="btn btn-ghost" onClick={() => setEditing(name)} style={{ fontSize: 12, padding: '4px 10px', color: 'var(--color-accent-700)' }}>เปลี่ยนชื่อ</button>
            </span>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); rename(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="input" autoFocus maxLength={50} value={editing} aria-label="ชื่อที่แสดง"
                onChange={(e) => setEditing(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setEditing(null); } }}
                style={{ flex: '1 1 180px', background: 'var(--color-neutral-100)', fontSize: 14 }} />
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)} disabled={busy} style={{ fontSize: 12.5 }}>ยกเลิก</button>
              <button type="submit" className="btn btn-primary" disabled={busy} style={{ fontSize: 12.5 }}>{busy ? 'กำลังบันทึก…' : 'บันทึก'}</button>
            </form>
          )}
          <span style={{ fontSize: 12.5, color: 'var(--color-neutral-700)', overflowWrap: 'anywhere' }}>{email}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[[posts?.length ?? '–', 'โพสต์'], [reports?.length ?? '–', 'รายงาน'], [interests.length, 'หมวดที่ติดตาม']].map(([n, l]) => (
            <span key={l} style={{ minWidth: 72, padding: '8px 10px', borderRadius: 12, background: 'var(--color-neutral-100)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <strong style={{ fontSize: 17 }}>{n}</strong>
              <span style={{ fontSize: 10.5, color: 'var(--color-neutral-700)' }}>{l}</span>
            </span>
          ))}
        </div>
      </section>

      <div className="mod-tabs" role="tablist" aria-label="ส่วนของโปรไฟล์" style={{ alignSelf: 'flex-start', maxWidth: '100%', overflowX: 'auto' }}>
        {TABS.map(([k, l, n]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={{ padding: '7px 14px', flex: 'none' }}>
            {l}{n !== null && <span className="mod-count">{n}</span>}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        posts === null ? <div style={empty}>กำลังโหลด…</div>
          : posts.length === 0 ? <div style={empty}>ยังไม่มีโพสต์ · เริ่มแบ่งปันเรื่องแรกของคุณได้จากปุ่ม &ldquo;โพสต์&rdquo;</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{posts.map(renderPost)}</div>
      )}

      {tab === 'reports' && (
        reports === null ? <div style={empty}>กำลังโหลด…</div>
          : reports.length === 0 ? <div style={empty}>คุณยังไม่เคยรายงานโพสต์</div>
          : (
            <div style={{ ...card, overflow: 'hidden' }}>
              {openReports > 0 && (
                <div style={{ padding: '10px 14px', fontSize: 12, background: 'var(--color-accent-100)', color: 'var(--color-accent-900)' }}>
                  มี {openReports} รายงานที่รอผู้ดูแลตรวจ · คุณจะได้รับแจ้งเตือนเมื่อตรวจเสร็จ
                </div>
              )}
              {reports.map((r, i) => {
                const [bg, fg] = statusLook(r.status);
                return (
                  <button key={r.id} className="hov-bg" disabled={r.post_deleted} onClick={() => onOpenPost(r.post_id)}
                    style={{ width: '100%', textAlign: 'left', cursor: r.post_deleted ? 'default' : 'pointer', border: 0, borderTop: i || openReports ? '1px solid var(--color-divider)' : 0, background: 'transparent', padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <strong style={{ fontSize: 13.5 }}>{r.post_deleted ? 'โพสต์นี้ถูกลบแล้ว' : r.title || 'ไม่มีชื่อ'}</strong>
                      <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>เหตุผล: {r.reason}</span>
                      <span style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>
                        ส่งเมื่อ <time dateTime={r.created_at} title={fullDate(r.created_at)}>{timeAgo(r.created_at)}</time>
                        {r.reviewed_at && r.status !== 'Open' && <> · ตรวจเมื่อ <time dateTime={r.reviewed_at} title={fullDate(r.reviewed_at)}>{timeAgo(r.reviewed_at)}</time></>}
                      </span>
                    </span>
                    <span className="tag" style={{ flex: 'none', background: bg, color: fg, fontSize: 10.5, fontWeight: 700 }}>{REPORT_LABEL[r.status]}</span>
                  </button>
                );
              })}
            </div>
          )
      )}

      {tab === 'interests' && (
        <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 12.5, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>เมื่อมีประกาศในหมวดเหล่านี้ คุณจะได้รับแจ้งเตือนที่ 🔔</span>
          {interests.length === 0
            ? <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>ยังไม่ได้ติดตามหมวดไหน</span>
            : (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {interests.map((n) => (
                  <span key={n} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: cats.find((c) => c.name === n)?.dot }} />{n}
                  </span>
                ))}
              </div>
            )}
          <button className="btn btn-primary" onClick={onEditInterests} style={{ alignSelf: 'flex-start', fontSize: 13 }}>เลือกหมวดที่ติดตาม</button>
        </div>
      )}
    </main>
  );
}
