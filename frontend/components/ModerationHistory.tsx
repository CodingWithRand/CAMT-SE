'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { REPORT_LABEL, fullDate, statusLook, timeAgo } from '@/lib/ui';
import { useApi } from './AuthContext';

/** Mirrors ModAction in api/src/modlog.ts. */
type Action =
  | 'report_reviewed' | 'report_dismissed' | 'report_reopened'
  | 'post_hidden' | 'post_unhidden' | 'post_edited' | 'post_deleted' | 'comment_deleted'
  | 'category_created' | 'category_updated' | 'category_deleted'
  | 'role_granted' | 'role_revoked';

interface Entry {
  action: Action;
  post_id: string | null;
  post_title: string | null;
  target_id: string | null;
  detail: string | null;
  at: string;
  by: string;
  by_name: string;
}

type Group = 'reports' | 'posts' | 'categories' | 'roles';

const NEUTRAL: [string, string] = ['var(--color-neutral-200)', 'var(--color-neutral-800)'];
const DANGER: [string, string] = ['var(--danger-soft)', 'var(--danger-ink)'];
const ACCENT: [string, string] = ['var(--color-accent-200)', 'var(--color-accent-800)'];

/** Wording per action: "<moderator> <verb> <object>". */
const LOOK: Record<Action, { group: Group; label: string; verb: string; icon: string; colors: [string, string] }> = {
  report_reviewed:  { group: 'reports', label: REPORT_LABEL.Reviewed, verb: `ตัดสินว่า "${REPORT_LABEL.Reviewed}" ให้โพสต์`, icon: '✓', colors: statusLook('Reviewed') },
  report_dismissed: { group: 'reports', label: REPORT_LABEL.Dismissed, verb: `ตัดสินว่า "${REPORT_LABEL.Dismissed}" ให้โพสต์`, icon: '–', colors: statusLook('Dismissed') },
  report_reopened:  { group: 'reports', label: 'ส่งกลับไปรอตรวจ', verb: 'ส่งรายงานกลับไปรอตรวจ ของโพสต์', icon: '↺', colors: statusLook('Open') },
  post_hidden:      { group: 'posts', label: 'ซ่อนโพสต์', verb: 'ซ่อนโพสต์', icon: '⦸', colors: ['var(--warn-soft)', 'var(--warn-ink)'] },
  post_unhidden:    { group: 'posts', label: 'แสดงอีกครั้ง', verb: 'แสดงโพสต์อีกครั้ง', icon: '◉', colors: NEUTRAL },
  post_edited:      { group: 'posts', label: 'แก้ไขโพสต์', verb: 'แก้ไขโพสต์', icon: '✎', colors: NEUTRAL },
  post_deleted:     { group: 'posts', label: 'ลบโพสต์', verb: 'ลบโพสต์', icon: '🗑', colors: DANGER },
  comment_deleted:  { group: 'posts', label: 'ลบความเห็น', verb: 'ลบความเห็นในโพสต์', icon: '🗑', colors: DANGER },
  category_created: { group: 'categories', label: 'เพิ่มหมวด', verb: 'เพิ่มหมวด', icon: '+', colors: ACCENT },
  category_updated: { group: 'categories', label: 'แก้ไขหมวด', verb: 'แก้ไขหมวด', icon: '✎', colors: ACCENT },
  category_deleted: { group: 'categories', label: 'ลบหมวด', verb: 'ลบหมวด', icon: '🗑', colors: DANGER },
  role_granted:     { group: 'roles', label: 'ให้สิทธิ์ผู้ดูแล', verb: 'ตั้งเป็นผู้ดูแล:', icon: '★', colors: ['var(--success-soft)', 'var(--success-ink)'] },
  role_revoked:     { group: 'roles', label: 'ถอนสิทธิ์ผู้ดูแล', verb: 'ถอนสิทธิ์ผู้ดูแลของ', icon: '☆', colors: DANGER },
};

const GROUPS: [Group | 'all', string][] = [['all', 'ทั้งหมด'], ['reports', 'รายงาน'], ['posts', 'โพสต์และความเห็น'], ['categories', 'หมวดหมู่'], ['roles', 'สิทธิ์']];

const card: CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 18 };

/** Who did what, and when: every moderator action, newest first. */
export function ModerationHistory({ revision, onOpenPost }: { revision: number; onOpenPost: (id: string) => void }) {
  const api = useApi();
  const [data, setData] = useState<{ complete: boolean; entries: Entry[] } | null>(null);
  const [group, setGroup] = useState<Group | 'all'>('all');
  const [who, setWho] = useState('all');

  const load = useCallback(async () => {
    const res = await api('/report/history').catch(() => null);
    if (res?.ok) setData(await res.json());
  }, [api]);
  useEffect(() => { load(); }, [load, revision]);

  const entries = useMemo(() => (data?.entries ?? []).filter((e) => LOOK[e.action]), [data]);
  const moderators = useMemo(() => [...new Set(entries.map((e) => e.by_name))].sort(), [entries]);
  const shown = entries.filter((e) => (group === 'all' || LOOK[e.action].group === group) && (who === 'all' || e.by_name === who));

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...card, padding: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="mod-tabs" role="tablist" aria-label="กรองตามประเภท" style={{ flex: 'none', maxWidth: '100%', overflowX: 'auto' }}>
          {GROUPS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={group === k} onClick={() => setGroup(k)} style={{ flex: 'none' }}>{l}</button>
          ))}
        </div>
        <select className="input" value={who} onChange={(e) => setWho(e.target.value)} aria-label="ผู้ดูแล"
          style={{ marginLeft: 'auto', width: 'auto', minHeight: 38, fontSize: 12.5, background: 'var(--color-neutral-100)' }}>
          <option value="all">ผู้ดูแลทุกคน</option>
          {moderators.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {data && !data.complete && (
        <div role="note" style={{ ...card, padding: '10px 14px', fontSize: 12, lineHeight: 1.5, background: 'var(--warn-soft)', color: 'var(--warn-ink)', borderColor: 'transparent' }}>
          ยังไม่ได้เปิดบันทึกประวัติแบบเต็ม จึงเห็นเฉพาะการตัดสินล่าสุดของแต่ละรายงานและโพสต์ที่ยังถูกซ่อน · รัน <code>api/sql/2026-10-13_moderation_log.sql</code> ใน Supabase เพื่อบันทึกทุกการกระทำต่อจากนี้
        </div>
      )}

      <div style={{ ...card, overflow: 'hidden' }}>
        {data === null && <div style={{ padding: 24, fontSize: 13, color: 'var(--color-neutral-600)' }}>กำลังโหลด…</div>}
        {data && shown.length === 0 && <div style={{ padding: 24, fontSize: 13, color: 'var(--color-neutral-600)' }}>ยังไม่มีประวัติในตัวกรองนี้</div>}
        {shown.map((e, i) => {
          const look = LOOK[e.action];
          const object = e.post_id ? `"${e.post_title || 'ไม่มีชื่อ'}"` : e.detail ?? '';
          const extra = e.post_id ? e.detail : null;
          const Row = e.post_id ? 'button' : 'div';
          return (
            <Row key={`${e.action}-${e.at}-${i}`} className={e.post_id ? 'hov-bg' : undefined} onClick={e.post_id ? () => onOpenPost(e.post_id!) : undefined}
              style={{ width: '100%', textAlign: 'left', cursor: e.post_id ? 'pointer' : 'default', border: 0, borderTop: i ? '1px solid var(--color-divider)' : 0, background: 'transparent', padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
              <span aria-hidden="true" style={{ flex: 'none', width: 30, height: 30, borderRadius: 10, display: 'grid', placeItems: 'center', fontWeight: 700, background: look.colors[0], color: look.colors[1] }}>{look.icon}</span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 13, lineHeight: 1.45 }}>
                  <strong>{e.by_name}</strong> {look.verb} <strong>{object}</strong>
                </span>
                {extra && <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{e.action === 'post_hidden' ? `เหตุผล: ${extra}` : extra}</span>}
                <time dateTime={e.at} title={fullDate(e.at)} style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>{timeAgo(e.at)}</time>
              </span>
              <span className="tag" style={{ flex: 'none', background: look.colors[0], color: look.colors[1], fontSize: 10.5, fontWeight: 700 }}>{look.label}</span>
            </Row>
          );
        })}
      </div>
      <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', padding: '0 4px' }}>ล่าสุด 300 รายการ · กดรายการที่เกี่ยวกับโพสต์เพื่อเปิดโพสต์นั้น</span>
    </section>
  );
}
