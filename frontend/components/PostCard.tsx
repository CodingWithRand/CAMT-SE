'use client';

import type { CSSProperties } from 'react';
import { ANNOUNCE_CAT, QA, type Category, type Post, type ReactionType, type ReportStatus } from '@/lib/data';
import { REPORT_LABEL, avatarStyle, fullDate, statusLook } from '@/lib/ui';
import ReactionBar from './ReactionBar';

export interface PostCardProps {
  cats: Category[];
  post: Post;
  liked: ReactionType | null;
  commentCount: number;
  reportStatus?: ReportStatus;
  isGuest: boolean;
  onReact: (r: ReactionType, change: boolean) => void;
  onGate: () => void;
  onOpen: () => void;
  canEdit: boolean;           // the viewer wrote it, or is a moderator
  onEdit: () => void;
  onDelete: () => void;       // shown to the author only
  onReport: () => void;
}


export default function PostCard(props: PostCardProps) {
  const { post: p, liked, commentCount, reportStatus: status, isGuest, cats: allCats } = props;

  const rail = p.priority === 'urgent' ? 'var(--pri)' : p.priority === 'notice' ? 'var(--color-accent)' : null;
  const cats = p.cats || [];

  const chips: { label: string; style: CSSProperties }[] = cats.map((c) => {
    const row = allCats.find((x) => x.name === c) || { pri: 5 };
    return {
      label: c.split(' / ')[0],
      style: row.pri <= 2
        ? { background: 'var(--color-accent-100)', color: 'var(--color-accent-800)' }
        : { background: 'var(--color-neutral-200)', color: 'var(--color-neutral-800)' },
    };
  });
  if (p.important && (p.priority === 'urgent' || !cats.includes(ANNOUNCE_CAT))) {
    chips.push({
      label: p.priority === 'urgent' ? 'ประกาศด่วน' : 'ประกาศทางการ',
      style: p.priority === 'urgent'
        ? { background: '#f2c6b6', color: '#6f2f14', fontWeight: 700 }
        : { background: 'var(--peach)', color: 'var(--color-accent-800)', fontWeight: 700 },
    });
  } else if (cats.includes(QA) && commentCount === 0) {
    chips.push({ label: 'ยังไม่มีความเห็น', style: { background: 'var(--color-accent-2-200)', color: 'var(--color-accent-2-800)', fontWeight: 700 } });
  }
  if (p.edited) {
    chips.push({ label: p.edited, style: { background: 'var(--color-neutral-200)', color: 'var(--color-neutral-700)' } });
  }
  if (status) {
    const [bg, fg] = statusLook(status);
    // Read-only: status is changed in the moderation center only.
    chips.push({ label: `รายงาน: ${REPORT_LABEL[status]}`, style: { background: bg, color: fg, fontWeight: 700 } });
  }

  const media = p.media || [];
  const likes = p.likes;

  return (
    <article style={{ position: 'relative', overflow: 'hidden', opacity: p.hidden ? 0.92 : 1, background: 'var(--color-surface)', borderRadius: 16, boxShadow: '0 1px 3px rgba(62,34,89,.09)', border: '1px solid var(--color-divider)', padding: '16px 18px 10px', display: 'flex', flexDirection: 'column', gap: 11 }}>
      {rail && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: rail }} />}

      {p.hidden && (
        <div role="note" style={{ display: 'flex', gap: 9, alignItems: 'flex-start', margin: '-4px -4px 0', padding: '9px 12px', borderRadius: 12, background: 'var(--color-neutral-800)', color: '#fff', fontSize: 12.5, lineHeight: 1.45 }}>
          <span aria-hidden="true" style={{ fontSize: 14 }}>⦸</span>
          <span>
            <strong>ถูกซ่อน</strong> · {p.mine ? 'ผู้ดูแลซ่อนโพสต์นี้ คนอื่นจะมองไม่เห็น (เห็นแค่คุณกับผู้ดูแล)' : 'ผู้ใช้ทั่วไปมองไม่เห็นโพสต์นี้ (เห็นแค่เจ้าของโพสต์กับผู้ดูแล)'}
            {p.hidden.reason && <span style={{ display: 'block', opacity: 0.85 }}>เหตุผล: {p.hidden.reason}</span>}
          </span>
        </div>
      )}

      <header style={{ display: 'flex', alignItems: 'flex-start', gap: 11, flexWrap: 'wrap' }}>
        <div style={avatarStyle(p.tint ?? 0)}>{p.initials}</div>
        <div style={{ minWidth: 190, flex: '1 1 210px' }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3, display: 'block' }}>
            {p.name}
            {p.role !== 'student' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: -2, marginLeft: 5 }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M8.5 12.4l2.4 2.3 4.6-5" />
              </svg>
            )}
          </span>
          <div style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>{p.meta} · <time dateTime={p.at} title={p.at ? fullDate(p.at) : undefined}>{p.time}</time></div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {chips.map((c, i) => (
            <span key={i} className="tag" style={{ fontSize: 10.5, ...c.style }}>{c.label}</span>
          ))}
        </div>
      </header>

      <div onClick={props.onOpen} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {p.title && <h4 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, lineHeight: 1.35, letterSpacing: 0, textWrap: 'pretty' }}>{p.title}</h4>}
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--color-neutral-800)', textWrap: 'pretty' }}>{p.body}</p>
        {media.length > 0 && (
          <div style={{ display: 'grid', gap: 6, gridTemplateColumns: media.length > 1 ? '1fr 1fr' : '1fr' }}>
            {media.map((m, i) => m.url && m.type === 'image' ? (
              <img key={i} src={m.url} alt={m.label || p.title} loading="lazy" style={{ width: '100%', height: media.length > 2 ? 110 : media.length > 1 ? 130 : undefined, maxHeight: media.length > 1 ? undefined : 420, objectFit: 'cover', borderRadius: 12, display: 'block', border: '1px solid rgba(42,34,51,.07)', gridColumn: media.length === 3 && i === 0 ? 'span 2' : undefined }} />
            ) : (
              <div key={i} style={{ height: media.length > 2 ? 110 : media.length > 1 ? 130 : 150, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#e5ccf3', border: '1px solid rgba(42,34,51,.07)', gridColumn: media.length === 3 && i === 0 ? 'span 2' : undefined }}>
                <span style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6c4194' }}>{m.type === 'video' ? 'video' : 'image'}</span>
                <span style={{ fontSize: 12, color: '#3e2259', textAlign: 'center', padding: '0 8px' }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}
        {!!p.notified && (
          <span style={{ fontSize: 11.5, color: 'var(--color-accent-700)' }}>ส่งแจ้งเตือนผู้ที่สนใจหมวดนี้ {p.notified.toLocaleString()} คน</span>
        )}
      </div>

      <footer style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 8, borderTop: '1px solid var(--color-divider)' }}>
        <ReactionBar
          mine={liked}
          count={0 /* the total is spelled out beside the button instead */}
          disabled={isGuest}
          onReact={props.onReact}
          onBlocked={props.onGate}
        />
        <span style={{ fontSize: 12, color: 'var(--color-neutral-600)', flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {likes > 0 ? `${likes.toLocaleString()} รีแอค` : 'ยังไม่มีใครรีแอค'}
        </span>

        <button className="btn btn-ghost" style={{ flex: 'none', fontSize: 12.5, color: 'var(--color-neutral-700)', whiteSpace: 'nowrap' }} onClick={props.onOpen}>
          ความเห็น {commentCount}
        </button>
        {props.canEdit && (
          <button className="btn btn-ghost" style={{ flex: 'none', fontSize: 12, color: 'var(--color-accent-700)' }} onClick={props.onEdit}
            title={p.mine ? 'แก้ไขโพสต์ของคุณ' : 'แก้ไขโพสต์ (ผู้ดูแล)'}>แก้ไข</button>
        )}
        {p.mine && (
          <button className="btn btn-ghost" style={{ flex: 'none', fontSize: 12, color: '#8a3a1c' }} onClick={props.onDelete} title="ลบโพสต์ของคุณ">ลบ</button>
        )}
        {!p.mine && (
          <button className="btn btn-ghost" style={{ flex: 'none', fontSize: 12, color: 'var(--color-neutral-600)' }} onClick={props.onReport}>รายงาน</button>
        )}
      </footer>
    </article>
  );
}
