'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Post } from '@/lib/data';
import { REPORT_LABEL, statusLook } from '@/lib/ui';
import type { ModReport } from './WhongNaiMor';

type Tab = 'open' | 'hidden' | 'closed';
type Sort = 'oldest' | 'most';

interface Props {
  reports: ModReport[];
  compact: boolean;                         // narrow screens: list, then detail
  blocked: boolean;                         // a dialog is open: keyboard shortcuts pause
  ensurePost: (id: string) => Promise<Post | null>;
  renderPost: (p: Post) => ReactNode;
  timeAgo: (stamp: string) => string;
  onDismiss: (postId: string) => void;      // no problem found
  onEdit: (postId: string) => void;
  onHide: (postId: string) => void;
  onUnhide: (postId: string) => void;
  onReopen: (postId: string) => void;
  onRefresh: () => void;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'open', label: REPORT_LABEL.Open },
  { key: 'hidden', label: 'ถูกซ่อน' },
  { key: 'closed', label: 'เสร็จแล้ว' },
];

const inTab = (r: ModReport, tab: Tab) =>
  tab === 'open' ? r.status === 'Open' && r.tickets.length > 0
    : tab === 'hidden' ? r.hidden
    : r.status !== 'Open' && !r.hidden && r.tickets.length > 0;

/** The preset reason, without the reporter's extra details ("reason · details"). */
const baseReason = (reason: string) => reason.split(' · ')[0];

/**
 * Inbox-style moderation page: the queue on the left, the selected post with its
 * reports and the three decisions on the right. After a decision the next report opens.
 */
export function ModerationCenter({
  reports, compact, blocked, ensurePost, renderPost, timeAgo,
  onDismiss, onEdit, onHide, onUnhide, onReopen, onRefresh,
}: Props) {
  const [tab, setTab] = useState<Tab>('open');
  const [sort, setSort] = useState<Sort>('oldest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null | 'loading'>(null);
  const lastIndex = useRef(0);

  const list = useMemo(() => reports
    .filter((r) => inTab(r, tab))
    .sort((a, b) => sort === 'most'
      ? b.tickets.length - a.tickets.length
      : (a.tickets[0]?.at ?? '').localeCompare(b.tickets[0]?.at ?? '')),
  [reports, tab, sort]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, reports.filter((r) => inTab(r, t.key)).length])) as Record<Tab, number>, [reports]);
  const selected = list.find((r) => r.post_id === selectedId) ?? null;

  // Keep a selection: when the selected report leaves this tab (it was just decided),
  // open the one now at the same position, so the moderator moves straight to the next.
  useEffect(() => {
    if (selected) {
      lastIndex.current = list.indexOf(selected);
      return;
    }
    if (compact && selectedId === null) return; // on phones the list shows first
    const next = list[Math.min(lastIndex.current, list.length - 1)];
    setSelectedId(next?.post_id ?? null);
  }, [list, selected, selectedId, compact]);

  // Load the full post for the detail pane.
  useEffect(() => {
    if (!selectedId) { setPost(null); return; }
    let cancelled = false;
    setPost('loading');
    ensurePost(selectedId).then((p) => { if (!cancelled) setPost(p); });
    return () => { cancelled = true; };
    // ensurePost changes identity every render; the post id is what matters here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // J/K move through the queue; D, E, H decide (when no dialog or text field has focus).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (blocked || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')) return;
      const i = list.findIndex((r) => r.post_id === selectedId);
      const key = e.key.toLowerCase();
      if (key === 'j' || key === 'arrowdown') { e.preventDefault(); setSelectedId(list[Math.min(i + 1, list.length - 1)]?.post_id ?? null); }
      else if (key === 'k' || key === 'arrowup') { e.preventDefault(); setSelectedId(list[Math.max(i - 1, 0)]?.post_id ?? null); }
      else if (!selected) return;
      else if (key === 'd' && selected.status === 'Open' && selected.tickets.length) onDismiss(selected.post_id);
      else if (key === 'e') onEdit(selected.post_id);
      else if (key === 'h' && !selected.hidden) onHide(selected.post_id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [blocked, list, selectedId, selected, onDismiss, onEdit, onHide]);

  const showList = !compact || !selectedId;
  const showDetail = !compact || !!selectedId;

  return (
    <section aria-label="รายงาน" style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '0 2px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
            {counts.open ? `มี ${counts.open} โพสต์${REPORT_LABEL.Open} · เลือกโพสต์ทางซ้าย แล้วเลือกว่าจะทำอะไร` : 'ไม่มีรายงานค้าง · เยี่ยมมาก!'}
          </span>
        </div>
        <button className="btn btn-secondary" onClick={onRefresh} style={{ fontFamily: 'var(--font-body)', fontSize: 12.5 }}>↻ โหลดใหม่</button>
      </div>

      <div className="mod-shell">
        {/* ── Queue ── */}
        {showList && (
          <div className="mod-panel" style={{ position: compact ? 'static' : 'sticky', top: 84 }}>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid var(--color-divider)' }}>
              <div className="mod-tabs" role="tablist" aria-label="สถานะรายงาน">
                {TABS.map((t) => (
                  <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => { setTab(t.key); setSelectedId(null); lastIndex.current = 0; }}>
                    {t.label} <span className="mod-count">{counts[t.key]}</span>
                  </button>
                ))}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--color-neutral-700)', padding: '0 4px' }}>
                เรียงตาม
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
                  style={{ font: 'inherit', fontSize: 11.5, border: '1px solid var(--color-divider)', borderRadius: 8, padding: '3px 6px', background: 'var(--color-neutral-100)', color: 'var(--color-text)' }}>
                  <option value="oldest">รอนานที่สุด</option>
                  <option value="most">ถูกรายงานมากที่สุด</option>
                </select>
              </label>
            </div>

            <div role="listbox" aria-label="คิวรายงาน" style={{ maxHeight: compact ? 'none' : 'calc(100vh - 260px)', overflowY: 'auto' }}>
              {list.map((r) => {
                const [bg, fg] = statusLook(r.status);
                const reasons = [...new Set(r.tickets.map((t) => baseReason(t.reason)))];
                return (
                  <button key={r.post_id} role="option" aria-selected={r.post_id === selectedId} aria-current={r.post_id === selectedId}
                    className="mod-item" onClick={() => setSelectedId(r.post_id)}>
                    <span style={{ flex: 'none', marginTop: 5, width: 8, height: 8, borderRadius: 999, background: r.status === 'Open' ? 'var(--pri)' : 'var(--color-neutral-400)' }} />
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reasons.join(' · ')}</span>
                      <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', fontSize: 11 }}>
                        {r.tickets.length
                          ? <span className="tag" style={{ background: bg, color: fg, fontWeight: 700, fontSize: 10 }}>{REPORT_LABEL[r.status]} · {r.tickets.length} รายงาน</span>
                          : <span className="tag" style={{ background: 'var(--color-neutral-200)', color: 'var(--color-neutral-800)', fontWeight: 700, fontSize: 10 }}>ไม่มีคนรายงาน</span>}
                        {r.hidden && <span className="tag" style={{ background: 'var(--color-neutral-800)', color: '#fff', fontWeight: 700, fontSize: 10 }}>ถูกซ่อน</span>}
                        <span style={{ color: 'var(--color-neutral-600)' }}>
                          {!r.tickets.length ? 'ผู้ดูแลซ่อนเอง' : r.status === 'Open' ? `รายงาน${timeAgo(r.tickets[0]?.at ?? '') === 'เมื่อสักครู่' ? 'เมื่อสักครู่' : ` ${timeAgo(r.tickets[0]?.at ?? '')}`}` : `รายงานล่าสุด ${timeAgo(r.tickets.at(-1)?.at ?? '')}`}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
              {list.length === 0 && (
                <div style={{ padding: '34px 18px', textAlign: 'center', color: 'var(--color-neutral-600)', fontSize: 13 }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }} aria-hidden="true">{tab === 'open' ? '🎉' : '🗂️'}</div>
                  {tab === 'open' ? 'ไม่มีโพสต์ที่รอตรวจ' : tab === 'hidden' ? 'ไม่มีโพสต์ที่ถูกซ่อน' : 'ยังไม่มีรายงานที่จัดการเสร็จ'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Detail ── */}
        {showDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            {compact && (
              <button className="btn btn-ghost" onClick={() => setSelectedId(null)} style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-body)', fontSize: 13 }}>← กลับไปที่คิว</button>
            )}

            {!selected ? (
              <div className="mod-panel" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-neutral-600)', fontSize: 13.5 }}>
                เลือกโพสต์จากคิวด้านซ้ายเพื่อตรวจสอบ
              </div>
            ) : (
              <>
                {/* Decision bar first, so it is in reach without scrolling past the post */}
                <div className="mod-panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                      {selected.status === 'Open' && selected.tickets.length ? 'จะทำอะไรกับโพสต์นี้?'
                        : !selected.tickets.length ? `ถูกซ่อนโดยผู้ดูแล${selected.hiddenReason ? ` · เหตุผล: ${selected.hiddenReason}` : ''}`
                        : `${REPORT_LABEL[selected.status]}${selected.hidden ? ' · โพสต์ถูกซ่อน' : ''}`}
                    </span>
                    {!compact && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-neutral-600)' }}>กด J / K เพื่อเลื่อนรายการ</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flexDirection: compact ? 'column' : 'row' }}>
                    {selected.status === 'Open' ? (
                      <>
                        <button className="mod-action" onClick={() => onDismiss(selected.post_id)} style={{ background: '#e4efd2', color: '#33401f' }}>
                          ✓ ไม่พบปัญหา {!compact && <kbd>D</kbd>}
                        </button>
                        <button className="mod-action" onClick={() => onEdit(selected.post_id)} style={{ background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', borderColor: 'var(--color-accent-300)' }}>
                          ✎ แก้ไขโพสต์ {!compact && <kbd>E</kbd>}
                        </button>
                        <button className="mod-action" onClick={() => onHide(selected.post_id)} style={{ background: '#a2391c', color: '#fff' }}>
                          ⦸ ซ่อนโพสต์ {!compact && <kbd>H</kbd>}
                        </button>
                      </>
                    ) : (
                      <>
                        {selected.hidden
                          ? <button className="mod-action" onClick={() => onUnhide(selected.post_id)} style={{ background: 'var(--color-neutral-200)', color: 'var(--color-text)' }}>↺ แสดงโพสต์อีกครั้ง</button>
                          : <button className="mod-action" onClick={() => onHide(selected.post_id)} style={{ background: '#fbeee8', color: '#8a3a1c', borderColor: '#e7b3a0' }}>⦸ ซ่อนโพสต์</button>}
                        <button className="mod-action" onClick={() => onEdit(selected.post_id)} style={{ background: 'var(--color-accent-100)', color: 'var(--color-accent-800)' }}>✎ แก้ไขโพสต์</button>
                        {selected.tickets.length > 0 && (
                          <button className="mod-action" onClick={() => onReopen(selected.post_id)} style={{ background: 'var(--color-neutral-100)', color: 'var(--color-neutral-800)', borderColor: 'var(--color-divider)' }}>↺ ตรวจใหม่อีกครั้ง</button>
                        )}
                      </>
                    )}
                  </div>
                  {selected.status === 'Open' && (
                    <span style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
                      ไม่พบปัญหา = ปิดรายงาน โพสต์อยู่เหมือนเดิม · แก้ไข = แก้โพสต์แล้วปิดรายงาน · ซ่อน = เอาโพสต์ออกจากฟีด — ผู้รายงานจะได้รับแจ้งผลทุกครั้ง
                    </span>
                  )}
                </div>

                {/* Reports */}
                {selected.tickets.length > 0 && <div className="mod-panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>รายงาน {selected.tickets.length} รายการ</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {Object.entries(selected.tickets.reduce<Record<string, number>>((acc, t) => {
                      const k = baseReason(t.reason);
                      acc[k] = (acc[k] ?? 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1]).map(([reason, n]) => (
                      <span key={reason} className="tag" style={{ background: '#f8ddd3', color: '#6f2f14', fontSize: 11.5, fontWeight: 600, padding: '4px 10px' }}>
                        {reason}{n > 1 ? ` ×${n}` : ''}
                      </span>
                    ))}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[...selected.tickets].reverse().map((t, i) => (
                      <li key={i} style={{ fontSize: 12.5, lineHeight: 1.5, background: 'var(--color-neutral-100)', borderRadius: 10, padding: '8px 11px' }}>
                        &ldquo;{t.reason}&rdquo;
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-600)' }}>{t.by} · {timeAgo(t.at)}</span>
                      </li>
                    ))}
                  </ul>
                </div>}

                {/* The post itself */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-700)', padding: '0 4px' }}>{selected.tickets.length ? 'โพสต์ที่ถูกรายงาน' : 'โพสต์'}</span>
                  {post === 'loading' && <div className="mod-panel" style={{ padding: 24, fontSize: 13, color: 'var(--color-neutral-600)' }}>กำลังโหลดโพสต์…</div>}
                  {post === null && <div className="mod-panel" style={{ padding: 24, fontSize: 13, color: 'var(--color-neutral-600)' }}>ไม่พบโพสต์นี้แล้ว</div>}
                  {post && post !== 'loading' && renderPost(post)}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
