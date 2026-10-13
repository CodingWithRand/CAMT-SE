'use client';

import { useEffect, useRef, useState } from 'react';
import { REACTIONS, REACTION_LOOK, type ReactionType } from '@/lib/data';

interface Props {
  /** The viewer's current reaction, or null when they have not reacted. */
  mine: ReactionType | null;
  count: number;
  disabled?: boolean;
  /** Smaller variant used inside comment threads. */
  compact?: boolean;
  /** Called with the reaction tapped; sending `mine` again clears it server-side. */
  onReact: (r: ReactionType, change: boolean) => void;
  /** Called instead of onReact when the viewer may not react (guests). */
  onBlocked?: () => void;
}

/**
 * Reaction control: tap to like / un-like, hold or hover to pick one of the six.
 *
 * It renders whatever `mine` and `count` say and never guesses ahead of the
 * server, so a rejected write simply leaves the previous state on screen.
 */
export default function ReactionBar({ mine, count, disabled, compact, onReact, onBlocked }: Props) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    clearTimeout(holdTimer.current);
  }, []);

  const look = mine ? REACTION_LOOK[mine] : null;
  const size = compact ? 12 : 12.5;

  const fire = (r: ReactionType, change?: boolean) => {
    setOpen(false);
    if (disabled) return onBlocked?.();
    onReact(r, change || false);
  };

  // Hover opens the picker on pointer devices; the delay stops it flickering
  // shut while the pointer travels from the button onto the popover.
  const hoverOpen = () => { clearTimeout(closeTimer.current); if (!disabled) setOpen(true); };
  const hoverClose = () => { closeTimer.current = setTimeout(() => setOpen(false), 220); };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={hoverOpen}
      onMouseLeave={hoverClose}
    >
      <button
        className="btn btn-ghost"
        aria-pressed={!!mine}
        aria-haspopup="true"
        aria-expanded={open}
        title={mine ? `${look!.label} · แตะเพื่อยกเลิก` : 'ถูกใจ · กดค้างเพื่อเลือกรีแอค'}
        onClick={() => fire(mine ?? 'like')}
        // Touch has no hover, so a long press opens the same picker.
        onTouchStart={() => { holdTimer.current = setTimeout(() => !disabled && setOpen(true), 420); }}
        onTouchEnd={() => clearTimeout(holdTimer.current)}
        style={{
          fontSize: size,
          padding: compact ? '5px 8px' : '5px 9px',
          gap: 5,
          color: mine ? 'var(--color-accent)' : 'var(--color-neutral-700)',
          fontWeight: mine ? 700 : 400,
        }}
      >
        <span style={{ fontSize: compact ? 13 : 14, lineHeight: 1 }}>{look?.icon ?? '👍'}</span>
        {look?.label ?? 'ถูกใจ'}
        {count > 0 && (
          <span style={{ fontWeight: 400, color: 'var(--color-neutral-600)' }}>{count.toLocaleString()}</span>
        )}
      </button>

      {open && !disabled && (
        <div
          role="menu"
          style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, zIndex: 5,
            display: 'flex', gap: 2, padding: 5,
            background: 'var(--color-surface)', border: '1px solid var(--color-divider)',
            borderRadius: 999, boxShadow: 'var(--shadow-lg)',
            animation: 'wnm-pop .12s ease both',
          }}
        >
          {REACTIONS.map((r) => (
            <button
              key={r}
              role="menuitem"
              title={REACTION_LOOK[r].label}
              aria-label={REACTION_LOOK[r].label}
              onClick={() => fire(r, true)}
              style={{
                cursor: 'pointer', border: 0, background: mine === r ? 'var(--color-accent-100)' : 'transparent',
                borderRadius: 999, padding: '4px 6px', fontSize: 17, lineHeight: 1,
              }}
            >
              {REACTION_LOOK[r].icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
