import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi, useAuthContext } from '@/components/AuthContext';
import type { ViewerRole } from '@/lib/state';
import type { Flash } from './useToast';

/**
 * Who is viewing: their display name and role from users.is_mod (via /user/current/fetch).
 * `reload` is called on live "roles" hints, so a new moderator gets their tools without
 * signing in again; the change is announced with a toast.
 * `forced` (a prop on the page) overrides the role while demoing.
 */
export function useViewer(flash: Flash, forced?: ViewerRole) {
  const { user } = useAuthContext();
  const api = useApi();
  const [me, setMe] = useState<{ display_name: string; is_mod: boolean } | null>(null);

  const reload = useCallback(async (isCancelled: () => boolean = () => false) => {
    if (!user?.id) return setMe(null);
    const res = await api('/user/current/fetch').catch(() => null);
    if (isCancelled()) return;
    if (!res?.ok) { console.warn('load viewer', res?.status); return setMe(null); }
    const data = await res.json();
    setMe({ display_name: data.display_name, is_mod: !!data.is_mod });
  }, [user?.id, api]);

  useEffect(() => {
    let cancelled = false;
    reload(() => cancelled);
    return () => { cancelled = true; };
  }, [reload]);

  const wasMod = useRef<boolean | null>(null);
  useEffect(() => {
    const now = me ? me.is_mod : null;
    if (wasMod.current !== null && now !== null && now !== wasMod.current) {
      flash(now ? 'คุณได้รับสิทธิ์ผู้ดูแลแล้ว · เมนู "ศูนย์ผู้ดูแล" อยู่ทางซ้าย' : 'สิทธิ์ผู้ดูแลของคุณถูกยกเลิกแล้ว');
    }
    wasMod.current = now;
  }, [me, flash]);

  // `me` is cleared one render after sign-out, so also require a user: otherwise that render
  // still counts as a moderator and fires mod-only requests without a token (401).
  const role: ViewerRole = forced ?? (me && user ? (me.is_mod ? 'moderator' : 'student') : 'guest');
  const name = role === 'guest' ? 'ผู้เยี่ยมชม' : (me?.display_name ?? user?.email?.split('@')[0] ?? '');
  return { user, role, isGuest: role === 'guest', isMod: role === 'moderator', name, reload };
}
