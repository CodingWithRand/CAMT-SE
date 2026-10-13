'use client';

import { useRef, useState, type CSSProperties } from 'react';
import ReactionBar from './ReactionBar';
import { ROLE_LABEL, ROLE_STYLE, type Comment, type Post, type ReactionType, type Reply } from '@/lib/data';
import { avatarStyle } from '@/lib/ui';
import PostCard, { type PostCardProps } from './PostCard';
import type { AppState, SetState } from '@/lib/state';

interface Props {
  st: AppState;
  set: SetState;
  active: Post;
  card: PostCardProps;
  isGuest: boolean;
  isMod: boolean;
  meName: string;
  meInitials: string;
  meAvatar: CSSProperties;
  gate: () => void;
  flash: (t: string) => void;
  onClose: () => void;
  /** POST a top-level comment; resolves false if the write failed. */
  onComment: (postId: string, text: string) => Promise<boolean>;
  /** POST a reply under `parentId`. */
  onReply: (postId: string, parentId: string, text: string) => Promise<boolean>;
  /** Toggle this viewer's reaction on one comment or reply. */
  onReactComment: (postId: string, commentId: string, r: ReactionType, change: boolean) => void;
  /** Edit your own comment or reply; resolves false if the write failed. */
  onEditComment: (postId: string, commentId: string, text: string) => Promise<boolean>;
  /** Delete a comment (yours, or any as a moderator) with its replies. */
  onDeleteComment: (postId: string, commentId: string) => Promise<boolean>;
}

/** Textareas grow with their content so the box reads like a single line until it needs more. */
const autoGrow = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

type BoxRef = React.RefObject<HTMLTextAreaElement | null>;
const shrink = (r: BoxRef) => { if (r.current) r.current.style.height = 'auto'; };

export default function PostModal({ st, set, active, card, isGuest, isMod, meName, meInitials, meAvatar, gate, flash, onClose, onComment, onReply, onReactComment, onEditComment, onDeleteComment }: Props) {
  const draftBox = useRef<HTMLTextAreaElement>(null);
  const replyBox = useRef<HTMLTextAreaElement>(null);
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const saveEdit = async () => {
    if (!editing) return;
    const text = editing.text.trim();
    if (!text) return flash('ความเห็นต้องไม่ว่าง');
    setSending(true);
    const ok = await onEditComment(active.id, editing.id, text);
    setSending(false);
    if (!ok) return flash('แก้ไขไม่สำเร็จ ลองใหม่อีกครั้ง');
    setEditing(null);
    flash('แก้ไขความเห็นแล้ว');
  };

  const remove = async (id: string) => {
    setSending(true);
    const ok = await onDeleteComment(active.id, id);
    setSending(false);
    setConfirmDelete(null);
    flash(ok ? 'ลบความเห็นแล้ว' : 'ลบไม่สำเร็จ ลองใหม่อีกครั้ง');
  };

  /** The comment text, or the edit box when it is being edited. */
  const body = (item: Reply, small: boolean) => editing?.id === item.id ? (
    <div style={{ marginTop: 4 }}>
      <textarea className="cmt-input" autoFocus rows={1} value={editing.text}
        ref={(el) => { if (el) autoGrow(el); }}
        onChange={(e) => { autoGrow(e.currentTarget); setEditing({ id: item.id, text: e.target.value }); }}
        onKeyDown={(e) => { if (e.key === 'Escape') setEditing(null); }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={() => setEditing(null)} style={{ fontSize: 12.5, padding: '6px 14px', color: 'var(--color-neutral-700)' }}>ยกเลิก</button>
        <button className="btn btn-primary" onClick={saveEdit} disabled={!editing.text.trim() || sending} style={{ padding: '6px 16px', fontSize: 12.5 }}>บันทึก</button>
      </div>
    </div>
  ) : (
    <p style={{ margin: '3px 0 0', fontSize: small ? 13 : 13.5, lineHeight: 1.5, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{item.text}</p>
  );

  /** Edit for your own; delete for your own or, as a moderator, anyone's. */
  const ownerActions = (item: Reply, replyCount = 0) => (
    <>
      {item.mine && editing?.id !== item.id && (
        <button className="btn btn-ghost" onClick={() => { setConfirmDelete(null); setEditing({ id: item.id, text: item.text }); }}
          style={{ fontSize: 12, padding: '5px 10px', color: 'var(--color-neutral-700)' }}>แก้ไข</button>
      )}
      {(item.mine || isMod) && (
        <button className="btn btn-ghost" onClick={() => setConfirmDelete(confirmDelete === item.id ? null : item.id)}
          style={{ fontSize: 12, padding: '5px 10px', color: '#8a3a1c' }}>ลบ</button>
      )}
      {confirmDelete === item.id && (
        <span role="alertdialog" aria-label="ยืนยันการลบความเห็น" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 12, background: '#f8ddd3', color: '#6f2f14', borderRadius: 10, padding: '4px 6px 4px 10px' }}>
          ลบความเห็นนี้{replyCount ? ` และการตอบกลับ ${replyCount} รายการ` : ''}?
          <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)} disabled={sending} style={{ fontSize: 12, padding: '3px 8px' }}>ยกเลิก</button>
          <button className="btn" onClick={() => remove(item.id)} disabled={sending} style={{ fontSize: 12, padding: '3px 10px', background: '#a2391c', color: '#fff', fontWeight: 600 }}>ลบ</button>
        </span>
      )}
    </>
  );

  const all = st.comments[active.id] || [];
  const shownCount = Math.min(st.shown, all.length);
  const thread = all.slice(0, shownCount);

  const submitComment = async () => {
    const text = st.draft.trim();
    if (!text) return flash('ยังไม่ได้พิมพ์ความเห็น');
    setSending(true);
    const ok = await onComment(active.id, text);
    setSending(false);
    if (!ok) return flash('ส่งความเห็นไม่สำเร็จ ลองใหม่อีกครั้ง');
    // Cleared only once the write succeeded, so a failure keeps what was typed.
    set((prev) => ({ draft: '', composerOpen: false, shown: Math.max(prev.shown, shownCount + 1) }));
    shrink(draftBox);
    flash('ส่งความเห็นแล้ว');
  };

  const submitReply = async (parent: Comment) => {
    const text = st.replyDraft.trim();
    if (!text) return flash('ยังไม่ได้พิมพ์คำตอบ');
    setSending(true);
    const ok = await onReply(active.id, parent.id, text);
    setSending(false);
    if (!ok) return flash('ตอบกลับไม่สำเร็จ ลองใหม่อีกครั้ง');
    set((prev) => ({
      replyTo: null,
      replyDraft: '',
      openReplies: { ...prev.openReplies, [parent.id]: true },
    }));
    shrink(replyBox);
    flash('ตอบกลับแล้ว');
  };

  // Posting the reaction is the parent's job; it owns the API call and the reload.
  const toggleLike = (id: string, r: ReactionType, change: boolean) => onReactComment(active.id, id, r, change);

  const openReplyBox = (c: Comment) => (isGuest ? gate() : set({ replyTo: c.id, replyDraft: '' }));

  /** The like / reply action row that sits under every comment and reply, YouTube style. */
  const actionRow = (id: string, baseLikes: number, onReply?: () => void, extra?: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 4, flexWrap: 'wrap' }}>
      <ReactionBar
        compact
        mine={st.cLikes[id] ?? null}
        // baseLikes is the server's reaction_count, which already counts this
        // viewer's own reaction — adding one for it would double-count.
        count={baseLikes}
        disabled={isGuest}
        onReact={(r, change) => toggleLike(id, r, change)}
        onBlocked={gate}
      />
      {onReply && (
        <button className="btn btn-ghost" onClick={onReply} style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', color: 'var(--color-neutral-700)' }}>
          ตอบกลับ
        </button>
      )}
      {extra}
    </div>
  );

  return (
    <div className="dialog-backdrop" style={{ zIndex: 39, animation: 'wnm-pop .16s ease both' }} onClick={(e) => { if (e.target === e.currentTarget) set({ activeId: null, replyTo: null }); }}>
      <div style={{ width: 'min(660px,100%)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', borderRadius: 20, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-bg)' }}>
          <h4 style={{ margin: 0, flex: 1, fontSize: 15, fontWeight: 700 }}>โพสต์ของ {active.name}</h4>
          <button className="btn btn-ghost" title="คัดลอกลิงก์ของโพสต์นี้" style={{ fontSize: 12.5, padding: '6px 12px' }}
            onClick={() => {
              const link = `${window.location.origin}/?post=${active.id}`;
              navigator.clipboard?.writeText(link).then(() => flash('คัดลอกลิงก์แล้ว · ส่งให้เพื่อนเปิดโพสต์นี้ได้เลย'), () => flash(link));
            }}>
            🔗 คัดลอกลิงก์
          </button>
          <button className="btn btn-secondary btn-icon" onClick={onClose} title="ปิด" aria-label="ปิด">✕</button>
        </header>

        <div style={{ overflow: 'auto', padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ flex: 'none' }}>
            <PostCard {...card} />
          </div>

          <section style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{all.length.toLocaleString()} ความเห็น</h4>
              {all.length > shownCount && (
                <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>แสดง {shownCount} รายการแรก</span>
              )}
            </div>

            {!isGuest ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={meAvatar}>{meInitials}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <textarea
                    ref={draftBox}
                    className="cmt-input"
                    rows={1}
                    value={st.draft}
                    onFocus={() => set({ composerOpen: true })}
                    onChange={(e) => { autoGrow(e.currentTarget); set({ draft: e.target.value }); }}
                    placeholder="เขียนความเห็น…"
                  />
                  {(st.composerOpen || st.draft) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', marginRight: 'auto' }}>โพสต์ในชื่อ {meName}</span>
                      <button className="btn btn-ghost" onClick={() => { shrink(draftBox); set({ draft: '', composerOpen: false }); }} style={{ fontSize: 12.5, padding: '7px 14px', color: 'var(--color-neutral-700)' }}>ยกเลิก</button>
                      <button className="btn btn-primary" onClick={submitComment} disabled={!st.draft.trim() || sending} style={{ padding: '7px 16px', fontSize: 12.5 }}>แสดงความเห็น</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: 'var(--color-neutral-700)', background: 'var(--color-neutral-100)', borderRadius: 14, padding: '13px 15px' }}>
                บัญชีภายนอกมหาวิทยาลัยอ่านโพสต์สาธารณะได้ แต่ไม่สามารถแสดงความเห็นหรือกดถูกใจได้
              </p>
            )}

            {thread.map((c) => {
              const replies = c.replies || [];
              const expanded = !!st.openReplies[c.id];
              return (
                <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={avatarStyle(c.t, 34)}>{c.i}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{c.a}</span>
                      {c.r !== 'student' && <span className="tag" style={{ ...ROLE_STYLE[c.r], fontSize: 10 }}>{ROLE_LABEL[c.r]}</span>}
                      <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>{c.time}</span>
                    </div>
                    {body(c, false)}

                    {actionRow(c.id, c.likes || 0, () => openReplyBox(c), ownerActions(c, replies.length))}

                    {st.replyTo === c.id && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 8 }}>
                        <span style={avatarStyle(isGuest ? 3 : 0, 26)}>{meInitials}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <textarea
                            ref={replyBox}
                            className="cmt-input"
                            rows={1}
                            autoFocus
                            value={st.replyDraft}
                            onChange={(e) => { autoGrow(e.currentTarget); set({ replyDraft: e.target.value }); }}
                            placeholder={`ตอบกลับ ${c.a}…`}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                            <button className="btn btn-ghost" onClick={() => { shrink(replyBox); set({ replyTo: null, replyDraft: '' }); }} style={{ fontSize: 12.5, padding: '6px 14px', color: 'var(--color-neutral-700)' }}>ยกเลิก</button>
                            <button className="btn btn-primary" onClick={() => submitReply(c)} disabled={!st.replyDraft.trim() || sending} style={{ padding: '6px 16px', fontSize: 12.5 }}>ตอบกลับ</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {replies.length > 0 && (
                      <button
                        className="btn btn-ghost"
                        onClick={() => set((prev) => ({ openReplies: { ...prev.openReplies, [c.id]: !prev.openReplies[c.id] } }))}
                        style={{ marginTop: 6, fontSize: 12.5, fontWeight: 600, padding: '6px 12px', color: 'var(--color-accent-700)', background: expanded ? 'transparent' : undefined }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease' }}>
                          <path d="M6 9.5l6 6 6-6" />
                        </svg>
                        {replies.length} การตอบกลับ
                      </button>
                    )}

                    {expanded && replies.map((r) => (
                      <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 12 }}>
                        <span style={avatarStyle(r.t, 26)}>{r.i}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{r.a}</span>
                            <span style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>{r.time}</span>
                          </div>
                          {body(r, true)}
                          {actionRow(r.id, r.likes || 0, undefined, ownerActions(r))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {all.length > shownCount && (
              <button className="btn btn-secondary" onClick={() => set((prev) => ({ shown: prev.shown + 15 }))} style={{ alignSelf: 'flex-start', fontSize: 12.5, padding: '8px 16px' }}>
                ดูความเห็นเพิ่มเติม (เหลืออีก {all.length - shownCount})
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
