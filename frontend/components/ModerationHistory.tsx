'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { REPORT_LABEL, fullDate, statusLook, timeAgo } from '@/lib/ui';
import { useApi } from './AuthContext';

type Kind = 'Reviewed' | 'Dismissed' | 'Hidden';

interface Entry {
  kind: Kind;
  post_id: string;
  title: string | null;
  by: string;
  by_name: string;
  at: string;
  tickets?: number;
  reason?: string | null;
}

const LOOK: Record<Kind, { label: string; icon: string; colors: [string, string] }> = {
  Reviewed: { label: REPORT_LABEL.Reviewed, icon: '✓', colors: statusLook('Reviewed') },
  Dismissed: { label: REPORT_LABEL.Dismissed, icon: '–', colors: statusLook('Dismissed') },
  Hidden: { label: 'ซ่อนโพสต์', icon: '⦸', colors: ['#f6d7a8', '#6b4210'] },
};

const card: CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 18 };

/** Who decided what, and when: report decisions and hidden posts, newest first. */
export function ModerationHistory({ revision, onOpenPost }: { revision: number; onOpenPost: (id: string) => void }) {
  const api = useApi();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [kind, setKind] = useState<Kind | 'all'>('all');
  const [who, setWho] = useState('all');

  const load = useCallback(async () => {
    const res = await api('/report/history').catch(() => null);
    if (res?.ok) setEntries(await res.json());
  }, [api]);
  useEffect(() => { load(); }, [load, revision]);

  const moderators = useMemo(() => [...new Set((entries ?? []).map((e) => e.by_name))].sort(), [entries]);
  const shown = (entries ?? []).filter((e) => (kind === 'all' || e.kind === kind) && (who === 'all' || e.by_name === who));

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...card, padding: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="mod-tabs" role="tablist" aria-label="กรองตามการตัดสิน" style={{ flex: 'none', maxWidth: '100%', overflowX: 'auto' }}>
          {(['all', 'Reviewed', 'Dismissed', 'Hidden'] as const).map((k) => (
            <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)} style={{ flex: 'none' }}>
              {k === 'all' ? 'ทั้งหมด' : LOOK[k].label}
            </button>
          ))}
        </div>
        <select className="input" value={who} onChange={(e) => setWho(e.target.value)} aria-label="ผู้ดูแล"
          style={{ marginLeft: 'auto', width: 'auto', minHeight: 38, fontSize: 12.5, background: 'var(--color-neutral-100)' }}>
          <option value="all">ผู้ดูแลทุกคน</option>
          {moderators.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {entries === null && <div style={{ padding: 24, fontSize: 13, color: 'var(--color-neutral-600)' }}>กำลังโหลด…</div>}
        {entries && shown.length === 0 && <div style={{ padding: 24, fontSize: 13, color: 'var(--color-neutral-600)' }}>ยังไม่มีประวัติในตัวกรองนี้</div>}
        {shown.map((e, i) => {
          const look = LOOK[e.kind];
          return (
            <button key={`${e.kind}-${e.post_id}-${e.at}`} className="hov-bg" onClick={() => onOpenPost(e.post_id)}
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 0, borderTop: i ? '1px solid var(--color-divider)' : 0, background: 'transparent', padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
              <span aria-hidden="true" style={{ flex: 'none', width: 30, height: 30, borderRadius: 10, display: 'grid', placeItems: 'center', fontWeight: 700, background: look.colors[0], color: look.colors[1] }}>{look.icon}</span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 13, lineHeight: 1.45 }}>
                  <strong>{e.by_name}</strong>{' '}
                  {e.kind === 'Hidden' ? 'ซ่อนโพสต์' : `ตัดสินว่า "${look.label}" ให้โพสต์`}{' '}
                  <strong>&ldquo;{e.title || 'ไม่มีชื่อ'}&rdquo;</strong>
                  {e.tickets ? ` (${e.tickets} รายงาน)` : ''}
                </span>
                {e.reason && <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>เหตุผล: {e.reason}</span>}
                <time dateTime={e.at} title={fullDate(e.at)} style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>{timeAgo(e.at)}</time>
              </span>
              <span className="tag" style={{ flex: 'none', background: look.colors[0], color: look.colors[1], fontSize: 10.5, fontWeight: 700 }}>{look.label}</span>
            </button>
          );
        })}
      </div>
      <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', padding: '0 4px' }}>
        แสดงการตัดสินล่าสุดของแต่ละรายงาน (ถ้าส่งรายงานกลับไปรอตรวจ รายการเดิมจะหายไป) และโพสต์ที่ยังถูกซ่อนอยู่ · ล่าสุด 200 รายการ
      </span>
    </section>
  );
}
