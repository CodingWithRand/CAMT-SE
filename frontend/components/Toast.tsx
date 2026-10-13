'use client';

import type { ToastState } from '@/hooks/useToast';

export function Toast({ toast, onAction }: { toast: ToastState | null; onAction: () => void }) {
  if (!toast) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: 'fixed', left: 0, right: 0, bottom: 24, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-accent-800)', color: '#fdf8f1', padding: toast.actionLabel ? '7px 8px 7px 20px' : '11px 20px', borderRadius: 999, boxShadow: 'var(--shadow-lg)', fontSize: 13, animation: 'wnm-rise .2s ease both', maxWidth: '90vw', textAlign: 'center' }}>
        <span>{toast.text}</span>
        {toast.actionLabel && (
          <button onClick={onAction}
            style={{ pointerEvents: 'auto', flex: 'none', cursor: 'pointer', border: 0, borderRadius: 999, padding: '6px 14px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, background: '#fdf8f1', color: 'var(--color-accent-800)' }}>
            {toast.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
