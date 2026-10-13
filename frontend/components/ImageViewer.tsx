'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-screen image viewer: arrows / ← → keys / swipe to move between a post's images.
 * Escape is handled by the page (it closes this before the post window underneath).
 */
export function ImageViewer({ images, index, alt, onIndex, onClose }: {
  images: string[];
  index: number;
  alt: string;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const many = images.length > 1;
  // Read through a ref so quick repeated presses (before a re-render) still step one by one.
  const at = useRef(index);
  at.current = index;
  const go = (step: number) => {
    at.current = (at.current + step + images.length) % images.length;
    onIndex(at.current);
  };
  const swipeFrom = useRef<number | null>(null);
  const swiped = useRef(false);   // the click that ends a swipe must not close the viewer
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => { closeBtn.current?.focus(); }, []);

  const arrow = (side: 'left' | 'right') => (
    <button className="viewer-btn" aria-label={side === 'left' ? 'รูปก่อนหน้า' : 'รูปถัดไป'}
      onClick={(e) => { e.stopPropagation(); go(side === 'left' ? -1 : 1); }}
      style={{ position: 'absolute', top: '50%', [side]: 'clamp(8px,2vw,24px)', transform: 'translateY(-50%)' }}>
      {side === 'left' ? '‹' : '›'}
    </button>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label={`รูปภาพ ${index + 1} จาก ${images.length}`} className="viewer"
      onClick={() => { if (swiped.current) swiped.current = false; else onClose(); }}
      onPointerDown={(e) => { swipeFrom.current = e.clientX; }}
      onPointerUp={(e) => {
        const from = swipeFrom.current;
        swipeFrom.current = null;
        if (many && from !== null && Math.abs(e.clientX - from) > 50) { swiped.current = true; go(e.clientX < from ? 1 : -1); }
      }}>
      <img src={images[index]} alt={alt} draggable={false} onClick={(e) => { e.stopPropagation(); swiped.current = false; }}
        style={{ maxWidth: '94vw', maxHeight: '86vh', objectFit: 'contain', borderRadius: 10, boxShadow: '0 10px 40px rgba(0,0,0,.4)', userSelect: 'none' }} />
      <button ref={closeBtn} className="viewer-btn" aria-label="ปิด" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, fontSize: 18 }}>✕</button>
      {many && arrow('left')}
      {many && arrow('right')}
      {many && (
        <span style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: 13, background: 'rgba(0,0,0,.45)', padding: '4px 12px', borderRadius: 999 }}>
          {index + 1} / {images.length}
        </span>
      )}
    </div>
  );
}
