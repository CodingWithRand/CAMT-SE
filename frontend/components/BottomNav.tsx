'use client';

import type { ReactNode } from 'react';
import type { View } from '@/lib/state';
import { BellIcon, MegaphoneIcon, PlusIcon, UserIcon } from './AuthIcons';

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19Z" />
  </svg>
);

/** Phone-width navigation along the bottom edge, where thumbs reach. */
export function BottomNav({ view, notifOpen, unread, onView, onCompose, onNotifications, onMe }: {
  view: View;
  notifOpen: boolean;
  unread: number;
  onView: (v: View) => void;
  onCompose: () => void;
  onNotifications: () => void;
  onMe: () => void;
}) {
  const item = (label: string, icon: ReactNode, on: boolean, onClick: () => void, badge = 0) => (
    <button className="bottom-nav-item" aria-current={on ? 'page' : undefined} onClick={onClick}>
      <span style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
        {icon}
        {badge > 0 && <span className="topbar-badge" style={{ top: -6, right: -10 }}>{badge > 9 ? '9+' : badge}</span>}
      </span>
      <span>{label}</span>
    </button>
  );
  return (
    <nav className="bottom-nav" aria-label="เมนูหลัก">
      {item('หน้าแรก', <HomeIcon />, view === 'home' && !notifOpen, () => onView('home'))}
      {item('ประกาศ', <MegaphoneIcon />, view === 'announce' && !notifOpen, () => onView('announce'))}
      <button className="bottom-nav-post" aria-label="เขียนโพสต์" onClick={onCompose}><PlusIcon /></button>
      {item('แจ้งเตือน', <BellIcon />, notifOpen, onNotifications, unread)}
      {item('ฉัน', <UserIcon />, view === 'profile' && !notifOpen, onMe)}
    </nav>
  );
}
