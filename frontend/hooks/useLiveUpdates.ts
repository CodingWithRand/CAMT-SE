import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/dbauth';

export type LiveTopic = 'posts' | 'comments' | 'reports' | 'notifications' | 'categories' | 'roles';
export type LiveHandlers = Record<LiveTopic, (postId?: string) => void>;

const EVERYTHING: LiveTopic[] = ['posts', 'comments', 'reports', 'notifications', 'categories', 'roles'];
const POLL_MS = 30_000;
const BATCH_MS = 400;

/**
 * Live updates. The API broadcasts which kind of data changed (api/src/live.ts);
 * this calls the handler for just that. A 30 s poll and a refresh when the tab regains
 * focus cover a missed broadcast or a dropped connection.
 * Handlers may change every render; the latest ones are used.
 */
export function useLiveUpdates(handlers: LiveHandlers) {
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const pending = new Set<LiveTopic>();
    const commentPosts = new Set<string>();   // threads to reload; empty = all of them
    let allComments = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Several changes in a burst (e.g. hide = post + reports + notifications) become one refresh.
    const queue = (topics: LiveTopic[], postId?: string) => {
      topics.forEach((t) => pending.add(t));
      if (topics.includes('comments')) { if (postId) commentPosts.add(postId); else allComments = true; }
      clearTimeout(timer);
      timer = setTimeout(() => {
        const h = latest.current;
        pending.forEach((t) => {
          if (t !== 'comments') return h[t]?.();
          if (allComments || !commentPosts.size) h.comments();
          else commentPosts.forEach((id) => h.comments(id));
        });
        pending.clear();
        commentPosts.clear();
        allComments = false;
      }, BATCH_MS);
    };

    const channel = supabase
      .channel('wnm-live')
      .on('broadcast', { event: 'changed' }, ({ payload }) => queue(Array.isArray(payload?.topics) ? payload.topics : [], payload?.post_id))
      .subscribe();

    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') queue(['posts', 'reports', 'notifications']);
    }, POLL_MS);
    const onBack = () => { if (document.visibilityState === 'visible') queue(EVERYTHING); };
    document.addEventListener('visibilitychange', onBack);
    window.addEventListener('focus', onBack);

    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onBack);
      window.removeEventListener('focus', onBack);
      supabase.removeChannel(channel);
    };
  }, []);
}
