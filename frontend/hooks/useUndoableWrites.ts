import { useCallback, useEffect, useRef } from 'react';
import type { Flash } from './useToast';

export interface UndoableWrite {
  message: string;                                   // toast shown with the "เลิกทำ" button
  apply: () => void;                                 // change the page now
  revert: () => void;                                // undo that change (on undo or failure)
  commit: (keepalive?: boolean) => Promise<void>;    // the API call; throws when the API refuses
  failMessage: string;
  after?: () => void;                                // once the API has accepted it
}

/**
 * Undo window: the page changes right away, but the request waits `delayMs` so "เลิกทำ"
 * can still cancel it. That matters because the API notifies people (reporters, authors)
 * the moment it runs, and a sent notification cannot be taken back.
 * Pending writes are sent immediately if the page is closed.
 */
export function useUndoableWrites(flash: Flash, delayMs: number) {
  const pending = useRef(new Map<string, { timer: ReturnType<typeof setTimeout>; commit: (keepalive?: boolean) => Promise<void> }>());

  const defer = useCallback((key: string, w: UndoableWrite) => {
    // A second change to the same thing first sends the one still waiting.
    const waiting = pending.current.get(key);
    if (waiting) { clearTimeout(waiting.timer); pending.current.delete(key); waiting.commit().catch(() => {}); }

    w.apply();
    const timer = setTimeout(async () => {
      pending.current.delete(key);
      try { await w.commit(); w.after?.(); }
      catch (err) { console.error(key, err); w.revert(); flash(w.failMessage); }
    }, delayMs);
    pending.current.set(key, { timer, commit: w.commit });
    flash(w.message, {
      label: 'เลิกทำ',
      run: () => {
        clearTimeout(timer);
        pending.current.delete(key);
        w.revert();
        flash('ยกเลิกแล้ว');
      },
    });
  }, [flash, delayMs]);

  const isPending = useCallback((key: string) => pending.current.has(key), []);

  useEffect(() => {
    const flush = () => pending.current.forEach((w) => { clearTimeout(w.timer); w.commit(true).catch(() => {}); });
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  return { defer, isPending };
}
