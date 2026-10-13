import { useApi } from '@/components/AuthContext';
import type { Post, ReactionType } from '@/lib/data';
import { mapAllPosts, type AppState, type SetState } from '@/lib/state';
import type { Flash } from './useToast';

/** Drop the key entirely when the reaction is cleared, so lookups stay falsy. */
const withReaction = (map: Record<string, ReactionType>, id: string, next?: ReactionType) => {
  const copy = { ...map };
  if (next) copy[id] = next; else delete copy[id];
  return copy;
};

/** The viewer's reactions on posts and comments. */
export function useReactions(st: Pick<AppState, 'likes' | 'cLikes'>, set: SetState, flash: Flash) {
  const api = useApi();

  /** Toggle a reaction; the API flips it and answers with the new total. */
  const react = async (kind: 'post' | 'comment', id: string, type: ReactionType, change: boolean): Promise<number> => {
    const res = await api(`/${kind}/${id}/react`, { method: 'POST', json: { reaction_type: type, change } });
    if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? `HTTP ${res.status}`);
    return res.json();
  };

  /** Post reactions show at once; the server's count replaces the guess, or everything rolls back. */
  const onPost = async (pid: string, type: ReactionType, change: boolean) => {
    const before = st.likes[pid];
    // Tapping the one already held clears it — same rule the endpoint applies.
    const next = before === type ? undefined : type;
    const delta = before && !next ? -1 : !before && next ? 1 : 0;
    const setCount = (count: (p: Post) => number) => set((prev) => mapAllPosts(prev, (list) =>
      list.map((p) => (p.id === pid ? { ...p, likes: Math.max(0, count(p)) } : p))));
    set((prev) => ({ likes: withReaction(prev.likes, pid, next) }));
    setCount((p) => p.likes + delta);
    try {
      const total = await react('post', pid, type, !!before && !!next && change);
      setCount(() => total);
    } catch (err) {
      console.error('reactToPost', err);
      set((prev) => ({ likes: withReaction(prev.likes, pid, before) }));
      setCount((p) => p.likes - delta);
      flash('รีแอคไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  /** Comment reactions update once the API answers. */
  const onComment = async (pid: string, cid: string, type: ReactionType, change: boolean) => {
    const before = st.cLikes[cid];
    const next = before === type ? undefined : type;
    try {
      const total = await react('comment', cid, type, !!before && !!next && change);
      set((prev) => ({
        cLikes: withReaction(prev.cLikes, cid, next),
        comments: {
          ...prev.comments,
          [pid]: (prev.comments[pid] ?? []).map((c) => c.id === cid
            ? { ...c, likes: total }
            : { ...c, replies: c.replies.map((r) => (r.id === cid ? { ...r, likes: total } : r)) }),
        },
      }));
    } catch (err) {
      console.error('reactToComment', err);
      flash('รีแอคไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  return { onPost, onComment };
}
