import { useCallback, useEffect, useRef, useState } from 'react';

export interface ToastAction { label: string; run: () => void }
export interface ToastState { text: string; actionLabel?: string }
export type Flash = (text: string, action?: ToastAction) => void;

const SHOW_MS = 2400;

/** One toast at a time. With an action button (e.g. "เลิกทำ") it stays up for `actionMs`. */
export function useToast(actionMs: number) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const action = useRef<ToastAction | undefined>(undefined);   // a function, so kept out of state
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flash: Flash = useCallback((text, act) => {
    action.current = act;
    setToast({ text, actionLabel: act?.label });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { action.current = undefined; setToast(null); }, act ? actionMs : SHOW_MS);
  }, [actionMs]);

  /** Run the toast's action once; it usually flashes its own follow-up message. */
  const runAction = useCallback(() => {
    const act = action.current;
    action.current = undefined;
    setToast((t) => (t ? { text: t.text } : t));
    act?.run();
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  return { toast, flash, runAction };
}
