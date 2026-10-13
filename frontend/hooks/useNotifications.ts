import { useApi } from '@/components/AuthContext';
import type { Notif, SetState } from '@/lib/state';
import type { Flash } from './useToast';

/** Reading notifications: open one (marks it read), or mark them all read. */
export function useNotifications(notifs: Notif[], set: SetState, flash: Flash, signedIn: boolean, openPost: (id: string) => void) {
  const api = useApi();

  const open = (n: Notif) => {
    if (!n.is_read && signedIn) {
      set((prev) => ({ notifs: prev.notifs.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)) }));
      api(`/notification/${n.id}/read`, { method: 'POST' }).catch((err) => console.error(err));
    }
    openPost(n.post_id);
  };

  /** The badge clears at once, and comes back if the API refuses. */
  const readAll = async () => {
    set({ notifs: notifs.map((n) => ({ ...n, is_read: true })) });
    const res = await api('/notification/read-all', { method: 'POST' }).catch(() => null);
    if (!res?.ok) {
      set({ notifs });
      return flash('อ่านทั้งหมดไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    flash('อ่านการแจ้งเตือนทั้งหมดแล้ว');
  };

  return { open, readAll, unread: notifs.filter((n) => !n.is_read).length };
}
