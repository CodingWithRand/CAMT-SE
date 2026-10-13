import { Fragment } from 'react';

/** `text` with every case-insensitive match of `query` wrapped in <mark>. */
export function Highlight({ text, query }: { text: string; query?: string }) {
  const q = query?.trim();
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => (i % 2 ? <mark key={i} className="search-hit">{part}</mark> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}
