import { useApi } from '@/components/AuthContext';
import type { Category } from '@/lib/data';
import type { SetState } from '@/lib/state';
import type { Flash } from './useToast';

/** Follow and unfollow categories (PUT /user/interests, the user_interests_op RPC: it replaces the whole list). */
export function useInterests({ interests, cats, loaded, set, flash, isGuest, onGuest, reload, onSaved }: {
  interests: string[];        // followed category ids
  cats: Category[];
  loaded: boolean;            // `interests` came from the server
  set: SetState;
  flash: Flash;
  isGuest: boolean;
  onGuest: () => void;        // guests are sent to the login window
  reload: () => void;         // load the followed categories again
  onSaved: () => void;        // e.g. refresh follower counts
}) {
  const api = useApi();

  /** Save these ids as the followed list; false if the API refused. */
  const put = async (ids: string[]) => {
    const res = await api('/user/interests', { method: 'PUT', json: { cate_id: ids } }).catch(() => null);
    return !!res?.ok;
  };

  /** From the follow dialog: replace the whole list. */
  const save = async (ids: string[]) => {
    if (!(await put(ids))) { flash('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'); return false; }
    set({ interests: ids });
    onSaved();
    flash(ids.length ? `ติดตาม ${ids.length} หมวดแล้ว · จะได้รับแจ้งเตือนเมื่อมีโพสต์ใหม่ในหมวดเหล่านี้` : 'เลิกติดตามทุกหมวดแล้ว');
    return true;
  };

  /** Follow or unfollow one category; the star changes at once and changes back if saving fails. */
  const toggle = async (id: string) => {
    if (isGuest) return onGuest();
    // Saving replaces the whole list, so it must start from what the server has.
    if (!loaded) { reload(); return flash('กำลังโหลดหมวดที่ติดตาม ลองอีกครั้งในอีกสักครู่'); }
    const name = cats.find((c) => c.id === id)?.name ?? 'หมวดนี้';
    const has = interests.includes(id);
    const next = has ? interests.filter((x) => x !== id) : [...interests, id];
    set({ interests: next });
    if (!(await put(next))) {
      set({ interests });
      return flash('บันทึกความสนใจไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    onSaved();
    flash(has ? `เลิกติดตาม ${name} แล้ว` : `ติดตาม ${name} แล้ว · จะได้รับแจ้งเตือนเมื่อมีโพสต์ใหม่ในหมวดนี้`);
  };

  return { save, toggle };
}
