import { useApi } from '@/components/AuthContext';
import type { WriteResult } from '@/components/PostModal';
import { rateLimitMessage } from '@/lib/api';
import type { Post, ReportStatus } from '@/lib/data';
import { mapAllPosts, postLists, type AppState, type SetState } from '@/lib/state';
import type { Flash } from './useToast';
import type { UndoableWrite } from './useUndoableWrites';

const STATUS_TOAST: Record<ReportStatus, string> = {
  Open: 'ส่งกลับไปรอตรวจแล้ว',
  Reviewed: 'จัดการแล้ว · แจ้งผลให้ผู้รายงานแล้ว',
  Dismissed: 'ไม่พบปัญหา · แจ้งผลให้ผู้รายงานแล้ว',
};

/**
 * Writes on posts, comments and reports. Deleting, hiding and report decisions wait out the
 * undo window (useUndoableWrites) because the API notifies people the moment they run.
 */
export function usePostActions({ st, set, flash, defer, loadComments, loadPosts, refreshReports }: {
  st: AppState;
  set: SetState;
  flash: Flash;
  defer: (key: string, w: UndoableWrite) => void;
  loadComments: (posts: Pick<Post, 'id'>[]) => Promise<void>;
  loadPosts: () => Promise<void>;
  refreshReports: () => Promise<unknown>;
}) {
  const api = useApi();

  /**
   * Comment writes, then re-read that post's thread: the create endpoints answer with an
   * empty 200, and the row the page needs carries joined fields (display_name, role).
   */
  const writeComment = async (postId: string, path: string, opts: Parameters<typeof api>[1]): Promise<WriteResult> => {
    const res = await api(path, opts).catch(() => null);
    if (!res?.ok) return (await rateLimitMessage(res)) ?? '';
    await loadComments([{ id: postId }]);
    return true;
  };
  const postComment = (postId: string, text: string, parentId?: string) =>
    writeComment(postId, parentId ? `/comment/${postId}/replyto/${parentId}` : `/comment/${postId}`, { method: 'POST', json: { content: text } });
  const editComment = (postId: string, commentId: string, text: string) =>
    writeComment(postId, `/comment/${commentId}`, { method: 'PUT', json: { content: text } });
  const deleteComment = (postId: string, commentId: string) =>
    writeComment(postId, `/comment/${commentId}`, { method: 'DELETE' });

  /** Send a report; resolves to an error message, or null on success. */
  const submitReport = async (postId: string, reason: string) => {
    const res = await api('/report/createticket', { method: 'POST', json: { post_id: postId, reason } }).catch(() => null);
    if (res?.status === 409) {
      await refreshReports();
      return 'คุณรายงานโพสต์นี้ไปแล้ว · รอผู้ดูแลตรวจสอบ';
    }
    if (!res?.ok) {
      console.error('submitReport', res?.status);
      return (await rateLimitMessage(res)) ?? 'ส่งรายงานไม่สำเร็จ ลองใหม่อีกครั้ง';
    }
    await refreshReports();
    return null;
  };

  /** An undoable request that throws when the API refuses (see useUndoableWrites). */
  const commitTo = (path: string, method: 'PUT' | 'DELETE', json?: unknown) => async (keepalive?: boolean) => {
    const res = await api(path, { method, json, keepalive });
    if (!res.ok) throw new Error(`${method} ${path} ${res.status}`);
  };

  /** Set the report status of post `id` (all of its tickets). The reporters get a notification. */
  const setStatus = (id: string, next: ReportStatus) => {
    const before = st.reportStatus[id];
    const beforeQueue = st.modReports.find((r) => r.post_id === id)?.status;
    if ((beforeQueue ?? before) === next) return;
    // Flip the chip and the queue now, roll back each to its own old value on undo or failure.
    const apply = (chip: ReportStatus | undefined, queue: ReportStatus | undefined) => set((prev) => ({
      reportStatus: chip ? { ...prev.reportStatus, [id]: chip } : prev.reportStatus,
      modReports: prev.modReports.map((r) => (r.post_id === id && queue ? { ...r, status: queue } : r)),
    }));
    defer(`status:${id}`, {
      message: STATUS_TOAST[next],
      apply: () => apply(next, next),
      revert: () => apply(before, beforeQueue),
      commit: commitTo(`/report/post/${id}/status`, 'PUT', { status: next }),
      failMessage: 'เปลี่ยนสถานะไม่สำเร็จ',
      after: refreshReports,
    });
  };

  /** Hide a post (moderators): it leaves the feed, its open reports close as Reviewed, reporters and author are told. */
  const hidePost = async (id: string, reason: string) => {
    const snapshot = { ...postLists(st), modReports: st.modReports, reportStatus: st.reportStatus };
    const drop = (list: Post[]) => list.filter((p) => p.id !== id);
    const flag = (list: Post[]) => list.map((p) => (p.id === id ? { ...p, hidden: { reason: reason || null } } : p));
    defer(`hide:${id}`, {
      message: 'ซ่อนโพสต์แล้ว · ผู้รายงานและเจ้าของโพสต์จะได้รับแจ้ง',
      apply: () => set((prev) => ({
        hideFor: null,
        activeId: prev.activeId === id ? null : prev.activeId,
        posts: drop(prev.posts),
        announce: drop(prev.announce),
        results: prev.results && drop(prev.results),
        // Still listed where the author or a moderator looks at it, now marked hidden.
        extraPosts: flag(prev.extraPosts),
        mine: prev.mine && flag(prev.mine),
        // The API closes open reports as Reviewed; show that already.
        modReports: prev.modReports.map((r) => (r.post_id === id ? { ...r, hidden: true, hiddenReason: reason, status: r.status === 'Open' ? 'Reviewed' : r.status } : r)),
        reportStatus: prev.reportStatus[id] === 'Open' ? { ...prev.reportStatus, [id]: 'Reviewed' } : prev.reportStatus,
      })),
      revert: () => set(snapshot),
      commit: commitTo(`/post/${id}/hide`, 'PUT', { reason }),
      failMessage: 'ซ่อนโพสต์ไม่สำเร็จ',
      after: refreshReports,
    });
  };

  /** Delete a post for good: the author's own, or any post for a moderator. */
  const deletePost = async (id: string) => {
    const snapshot = postLists(st);
    defer(`delete:${id}`, {
      message: 'ลบโพสต์แล้ว',
      apply: () => set((prev) => ({
        deleteFor: null,
        activeId: prev.activeId === id ? null : prev.activeId,
        ...mapAllPosts(prev, (list) => list.filter((p) => p.id !== id)),
      })),
      revert: () => set(snapshot),
      commit: commitTo(`/post/${id}/delete`, 'DELETE'),
      failMessage: 'ลบโพสต์ไม่สำเร็จ',
      after: refreshReports,
    });
  };

  /** Show a hidden post again (moderators). */
  const unhidePost = async (id: string) => {
    const res = await api(`/post/${id}/unhide`, { method: 'PUT' }).catch(() => null);
    if (!res?.ok) {
      console.error('unhidePost', res?.status);
      return flash('แสดงโพสต์อีกครั้งไม่สำเร็จ');
    }
    set((prev) => ({
      editFor: null,
      extraPosts: prev.extraPosts.map((p) => (p.id === id ? { ...p, hidden: undefined } : p)),
    }));
    flash('โพสต์กลับมาแสดงแล้ว');
    loadPosts();
    refreshReports();
  };

  return { postComment, editComment, deleteComment, submitReport, setStatus, hidePost, deletePost, unhidePost };
}
