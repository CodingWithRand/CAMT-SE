'use client';

import { useState, type ReactNode } from 'react';

type Section = 'reports' | 'history' | 'categories' | 'roles';
const SECTIONS: [Section, string][] = [['reports', 'รายงาน'], ['history', 'ประวัติ'], ['categories', 'หมวดหมู่'], ['roles', 'ผู้ใช้และสิทธิ์']];

/** ศูนย์ผู้ดูแล: tabs for the report queue, decision history, categories, and moderator roles. */
export function ModerationView({ wide, openReports, reports, history, categories, roles }: {
  wide: boolean;
  openReports: number;
  reports: ReactNode;
  history: ReactNode;
  categories: ReactNode;
  roles: ReactNode;
}) {
  const [section, setSection] = useState<Section>('reports');
  return (
    <main style={{ minWidth: 0, gridColumn: wide ? '2 / -1' : 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: '1 1 auto' }}>ศูนย์ผู้ดูแล</h3>
        <div className="mod-tabs" role="tablist" aria-label="ส่วนของศูนย์ผู้ดูแล" style={{ flex: 'none', maxWidth: '100%', overflowX: 'auto' }}>
          {SECTIONS.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={section === k} onClick={() => setSection(k)} style={{ padding: '7px 14px', flex: 'none' }}>
              {l}{k === 'reports' && openReports > 0 && <span className="mod-count">{openReports}</span>}
            </button>
          ))}
        </div>
      </div>
      {section === 'reports' && reports}
      {section === 'history' && history}
      {section === 'categories' && categories}
      {section === 'roles' && roles}
    </main>
  );
}
