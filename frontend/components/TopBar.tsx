'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Notif } from './WhongNaiMor';
import type { AuthMode } from './LoginDialog';
import { BellIcon, MegaphoneIcon, PlusIcon, SearchIcon, SmallCloseIcon } from './AuthIcons';

interface Props {
  w: number;
  query: string;
  onQuery: (q: string) => void;
  onHome: () => void;
  signedIn: boolean;
  canPost: boolean;
  onCompose: () => void;
  onLogin: (mode: AuthMode) => void;
  account: ReactNode;          // the AccountMenu, when signed in
  notifs: Notif[];
  unread: number;
  notifOpen: boolean;
  onNotifOpen: (open: boolean) => void;
  onOpenNotif: (n: Notif) => void;
  timeAgo: (stamp: string) => string;
}

export function TopBar({
  w, query, onQuery, onHome, signedIn, canPost, onCompose, onLogin, account,
  notifs, unread, notifOpen, onNotifOpen, onOpenNotif, timeAgo,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const compact = w < 640;

  // Shadow once the page scrolls under the bar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // "/" focuses search, like most sites with a search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== '/' || e.metaKey || e.ctrlKey || t.closest('input, textarea, [contenteditable="true"]')) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close the notification panel on outside click and on Escape.
  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e: MouseEvent) => { if (!notifRef.current?.contains(e.target as Node)) onNotifOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onNotifOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [notifOpen, onNotifOpen]);

  return (
    <header className="topbar" data-scrolled={scrolled}>
      <div className="topbar-inner">
        <button className="topbar-logo" onClick={onHome} aria-label="WhongNaiMor วงในมอ · กลับหน้าแรก">
          <Image src="/whongnaimor-icon.png" alt="" width={480} height={360} priority style={{ height: compact ? 40 : 50 }} />
          <span className="topbar-brand" aria-hidden="true">
            <span className="topbar-brand-name">WhongNaiMor</span>
            {!compact && <span className="topbar-brand-sub">วงในมอ</span>}
          </span>
        </button>

        <label className="topbar-search">
          <SearchIcon />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { onQuery(''); e.currentTarget.blur(); } }}
            placeholder="ค้นหาโพสต์ หมวดหมู่ หรือผู้ใช้"
            aria-label="ค้นหาโพสต์ หมวดหมู่ หรือผู้ใช้"
          />
          {query
            ? <button type="button" className="topbar-clear" onClick={() => { onQuery(''); searchRef.current?.focus(); }} aria-label="ล้างคำค้นหา"><SmallCloseIcon /></button>
            : <kbd className="topbar-kbd" aria-hidden="true">/</kbd>}
        </label>

        <div className="topbar-actions">
          {canPost && !compact && (
            <button className="topbar-compose" onClick={onCompose}>
              <PlusIcon /> โพสต์
            </button>
          )}

          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="topbar-icon"
              onClick={() => onNotifOpen(!notifOpen)}
              aria-label={unread ? `การแจ้งเตือน · ยังไม่อ่าน ${unread} รายการ` : 'การแจ้งเตือน'}
              aria-haspopup="dialog"
              aria-expanded={notifOpen}
              data-ring={unread > 0}
            >
              <BellIcon />
              {unread > 0 && <span className="topbar-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>

            {notifOpen && (
              <div className="notif-menu" role="dialog" aria-label="การแจ้งเตือน">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px 10px', borderBottom: '1px solid var(--color-divider)' }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>การแจ้งเตือน</span>
                  {unread > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--color-accent-200)', color: 'var(--color-accent-800)' }}>ใหม่ {unread}</span>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-neutral-600)' }}>จากโพสต์ประกาศ</span>
                </div>

                <div style={{ padding: 6, maxHeight: 'min(420px, 60vh)', overflowY: 'auto' }}>
                  {!signedIn ? (
                    <div style={{ display: 'grid', placeItems: 'center', gap: 10, textAlign: 'center', padding: '22px 16px' }}>
                      <span style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: 999, background: 'var(--color-accent-100)', color: 'var(--color-accent)' }}><BellIcon /></span>
                      <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>เข้าสู่ระบบเพื่อรับการแจ้งเตือนประกาศ<br />จากหมวดที่คุณสนใจ</span>
                      <button className="btn btn-primary" onClick={() => { onNotifOpen(false); onLogin('login'); }} style={{ fontFamily: 'var(--font-body)', fontSize: 13, padding: '8px 18px' }}>เข้าสู่ระบบ</button>
                    </div>
                  ) : notifs.length === 0 ? (
                    <div style={{ display: 'grid', placeItems: 'center', gap: 8, textAlign: 'center', padding: '26px 16px', color: 'var(--color-neutral-600)' }}>
                      <span style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: 999, background: 'var(--color-neutral-200)' }}><BellIcon /></span>
                      <span style={{ fontSize: 13 }}>ยังไม่มีการแจ้งเตือน</span>
                    </div>
                  ) : notifs.map((n) => (
                    <button key={n.id} className="notif-item" data-unread={!n.is_read} onClick={() => onOpenNotif(n)}>
                      <span style={{ flex: 'none', width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 12, background: n.is_read ? 'var(--color-neutral-200)' : '#f2c6b6', color: n.is_read ? 'var(--color-neutral-700)' : '#6f2f14' }}>
                        <MegaphoneIcon />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 13, lineHeight: 1.45, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>{timeAgo(n.created_at)}</span>
                      </span>
                      {!n.is_read && <span aria-label="ยังไม่อ่าน" style={{ flex: 'none', width: 8, height: 8, marginTop: 6, borderRadius: 999, background: 'var(--pri)' }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {signedIn ? account : (
            <>
              {!compact && (
                <button className="btn btn-ghost" onClick={() => onLogin('register')} style={{ fontFamily: 'var(--font-body)', fontSize: 13, padding: '8px 12px' }}>
                  สมัครสมาชิก
                </button>
              )}
              <button className="btn btn-primary" onClick={() => onLogin('login')} style={{ fontFamily: 'var(--font-body)', fontSize: 13, minHeight: 42, padding: '0 18px' }}>
                เข้าสู่ระบบ
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
