import { useEffect, useRef } from 'react';

/**
 * Deep links: the open post is in the URL (?post=<id>), so it can be shared, opening that
 * URL opens the post, and the browser's back button closes it again.
 */
export function usePostUrl(activeId: string | null, open: (id: string) => void, close: () => void) {
  const pushed = useRef(false);
  const handlers = useRef({ open, close });
  handlers.current = { open, close };

  useEffect(() => {
    const fromUrl = () => new URLSearchParams(window.location.search).get('post');
    const initial = fromUrl();
    if (initial) handlers.current.open(initial);
    const onPop = () => {
      pushed.current = false;
      const id = fromUrl();
      if (id) handlers.current.open(id);
      else handlers.current.close();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const inUrl = url.searchParams.get('post');
    if (activeId && inUrl !== activeId) {
      url.searchParams.set('post', activeId);
      window.history.pushState({ post: activeId }, '', url);
      pushed.current = true;
    } else if (!activeId && inUrl) {
      // Closed from the page: step back over our own entry, or just tidy the URL if it came from a link.
      if (pushed.current) { pushed.current = false; window.history.back(); }
      else { url.searchParams.delete('post'); window.history.replaceState(null, '', url); }
    }
  }, [activeId]);
}
