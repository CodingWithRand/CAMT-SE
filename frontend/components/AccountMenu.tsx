'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BellIcon, ChevronIcon, HeartIcon, LogoutIcon, ShieldIcon, UserIcon } from './AuthIcons';

interface Props {
  name: string;
  initials: string;
  email: string;
  isMod: boolean;
  avatar: CSSProperties;
  compact: boolean;          // narrow screens: avatar only
  unread: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInterests: () => void;
  onProfile: () => void;
  onNotifications: () => void;
  onSignOut: () => Promise<void>;
}

/** Avatar pill in the top bar that opens the account card (profile, shortcuts, sign out). */
export function AccountMenu({ name, initials, email, isMod, avatar, compact, unread, open, onOpenChange, onInterests, onProfile, onNotifications, onSignOut }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) { setConfirming(false); return; }
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [open, onOpenChange]);

  const firstName = name.split(' ')[0];

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        className="acct-trigger"
        aria-label="บัญชีของฉัน"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        style={compact ? { padding: 3 } : undefined}
      >
        <span style={{ ...avatar, width: 34, height: 34, fontSize: 12.5 }}>{initials}</span>
        {!compact && (
          <>
            <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{firstName}</span>
            <ChevronIcon />
          </>
        )}
      </button>

      {open && (
        <div className="acct-menu" role="menu" aria-label="บัญชีของฉัน">
          <div className="acct-head">
            <span style={{ ...avatar, width: 46, height: 46, fontSize: 16, flex: 'none', boxShadow: '0 0 0 3px color-mix(in srgb, #fff 55%, transparent)' }}>{initials}</span>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{name}</span>
              <span style={{ fontSize: 11.5, opacity: 0.85, overflowWrap: 'anywhere' }}>{email}</span>
              <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: 'color-mix(in srgb, #fff 22%, transparent)' }}>
                {isMod && <ShieldIcon />}
                {isMod ? 'ผู้ดูแลระบบ' : 'สมาชิก มช.'}
              </span>
            </div>
          </div>

          <div style={{ padding: 6 }}>
            <button role="menuitem" className="acct-item" onClick={() => { onOpenChange(false); onProfile(); }}>
              <UserIcon />
              <span style={{ flex: 1 }}>โปรไฟล์ของฉัน</span>
            </button>
            <button role="menuitem" className="acct-item" onClick={() => { onOpenChange(false); onNotifications(); }}>
              <BellIcon />
              <span style={{ flex: 1 }}>การแจ้งเตือน</span>
              {unread > 0 && (
                <span style={{ minWidth: 20, height: 20, padding: '0 6px', display: 'grid', placeItems: 'center', borderRadius: 999, background: 'var(--pri)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{unread}</span>
              )}
            </button>
            <button role="menuitem" className="acct-item" onClick={() => { onOpenChange(false); onInterests(); }}>
              <HeartIcon />
              <span style={{ flex: 1 }}>หมวดที่ติดตาม</span>
            </button>

            <div style={{ height: 1, background: 'var(--color-divider)', margin: '6px 8px' }} />

            {confirming ? (
              <div className="acct-confirm" role="alertdialog" aria-label="ยืนยันการออกจากระบบ">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>ออกจากระบบใช่ไหม?</div>
                <div style={{ fontSize: 11.5, opacity: 0.85, marginBottom: 10 }}>คุณจะกลับมาอ่านได้แบบผู้เยี่ยมชม</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" disabled={busy} onClick={() => setConfirming(false)}
                    style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12.5, borderColor: 'color-mix(in srgb, var(--danger-ink) 25%, transparent)', color: 'var(--danger-ink)' }}>
                    ยกเลิก
                  </button>
                  <button className="btn" disabled={busy} autoFocus
                    onClick={async () => { setBusy(true); try { await onSignOut(); } finally { setBusy(false); } }}
                    style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, background: 'var(--danger)', color: '#fff' }}>
                    {busy ? 'กำลังออก…' : 'ออกจากระบบ'}
                  </button>
                </div>
              </div>
            ) : (
              <button role="menuitem" className="acct-item is-danger" onClick={() => setConfirming(true)}>
                <LogoutIcon />
                <span style={{ flex: 1 }}>ออกจากระบบ</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
