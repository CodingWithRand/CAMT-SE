import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keep keyboard focus inside a dialog while it is open: Tab and Shift+Tab wrap around,
 * focus moves in on open (unless something inside already took it, e.g. autoFocus),
 * and goes back to whatever had it before when the dialog closes.
 */
export function useFocusTrap<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const before = document.activeElement as HTMLElement | null;
    const items = () => [...box.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!box.contains(document.activeElement)) (items()[0] ?? box).focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = items();
      if (!list.length) return e.preventDefault();
      const first = list[0]!, last = list[list.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !box.contains(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !box.contains(active))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Back to the button that opened it, if that is still on the page.
      if (before && document.contains(before)) before.focus({ preventScroll: true });
    };
  }, []);
  return ref;
}
