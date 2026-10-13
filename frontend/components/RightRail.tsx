'use client';

import { STATUSES, type Post, type ReportStatus } from '@/lib/data';
import { REPORT_LABEL, statusLook } from '@/lib/ui';

/** Right column: top announcements and, for moderators, the report counts. */
export function RightRail({ wide, announce, isMod, openReports, reportsByStatus, onOpenPost, onModeration }: {
  wide: boolean;
  announce: Post[];
  isMod: boolean;
  openReports: number;
  reportsByStatus: (s: ReportStatus) => number;
  onOpenPost: (id: string) => void;
  onModeration: () => void;
}) {
  const top = [...announce]
    .sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0) || b.likes - a.likes)
    .slice(0, 4);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 12, position: wide ? 'sticky' : 'static', top: 84, minWidth: 0 }}>
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>ประกาศ</h5>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-600)', lineHeight: 1.45 }}>ประกาศที่ถูกตรึง และประกาศจากบุคลากรที่มีการตอบรับสูงใน 24 ชั่วโมง</span>
        </div>
        {top.map((p) => (
          <button key={p.id} className="hov-border" onClick={() => onOpenPost(p.id)} style={{ cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: 5, padding: '10px 11px', borderRadius: 12, background: 'var(--color-neutral-100)', border: '1px solid var(--color-divider)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span className="tag" style={p.priority === 'urgent'
                ? { background: '#f2c6b6', color: '#6f2f14', fontSize: 10, fontWeight: 700 }
                : { background: 'var(--peach)', color: 'var(--color-accent-800)', fontSize: 10, fontWeight: 700 }}
              >
                {p.priority === 'urgent' ? 'ประกาศด่วน' : 'ประกาศ'}
              </span>
              <span style={{ fontSize: 10.5, color: 'var(--color-neutral-700)' }}>{p.likes.toLocaleString()} ถูกใจ</span>
            </span>
            <span style={{ fontSize: 12.5, lineHeight: 1.4, display: 'block', fontWeight: 600 }}>{p.title}</span>
            <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>{p.name}</span>
          </button>
        ))}
      </section>

      {isMod && (
        <section style={{ background: 'var(--peach)', border: '1px solid var(--color-accent-300)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>งานของผู้ดูแล</h5>
            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', lineHeight: 1.45 }}>
              {openReports ? `มี ${openReports} โพสต์รอตรวจ` : 'ไม่มีรายงานค้าง'}
            </span>
          </div>
          <div style={{ display: 'grid', gap: 7, gridTemplateColumns: 'repeat(3,1fr)' }}>
            {STATUSES.map((k) => {
              const [bg, fg] = statusLook(k);
              return (
                <div key={k} style={{ background: bg, color: fg, borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{reportsByStatus(k)}</span>
                  <span style={{ fontSize: 10, color: 'var(--color-neutral-700)', lineHeight: 1.25 }}>{REPORT_LABEL[k]}</span>
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary" onClick={onModeration} style={{ fontFamily: 'var(--font-body)', fontSize: 13, width: '100%' }}>
            เปิดศูนย์ผู้ดูแล →
          </button>
        </section>
      )}
    </aside>
  );
}
