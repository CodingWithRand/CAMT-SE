import supabase from "./db";

/**
 * Every notification the API writes. The page picks each one's icon from this wording
 * (notifKind in frontend/components/TopBar.tsx), so change both together.
 * Announcements are written by the database trigger in api/sql/2026-10-13_fix_announcement_notifications.sql.
 */
export const MESSAGES = {
    reportActioned: (title: string) => `ผู้ดูแลตรวจสอบโพสต์ "${title}" ที่คุณรายงานและดำเนินการแล้ว ขอบคุณที่ช่วยดูแลชุมชน`,
    reportDismissed: (title: string) => `ผู้ดูแลตรวจสอบโพสต์ "${title}" ที่คุณรายงานแล้ว ไม่พบการละเมิดกฎ`,
    reportedPostHidden: (title: string) => `ผู้ดูแลซ่อนโพสต์ "${title}" ที่คุณรายงานแล้ว ขอบคุณที่ช่วยดูแลชุมชน`,
    yourPostHidden: (title: string, reason: string | null) => `โพสต์ "${title}" ของคุณถูกซ่อนโดยผู้ดูแล${reason ? ` · เหตุผล: ${reason}` : ""}`,
    yourPostRestored: (title: string) => `โพสต์ "${title}" ของคุณกลับมาแสดงแล้ว`,
    commentOnYourPost: (who: string, title: string) => `${who} แสดงความเห็นในโพสต์ "${title}" ของคุณ`,
    replyToYourComment: (who: string, title: string) => `${who} ตอบกลับความเห็นของคุณในโพสต์ "${title}"`,
};

export const untitled = (title: string | null | undefined) => title || "ไม่มีชื่อ";

/** Insert notifications. The action they report already happened, so a failure is logged, not thrown. */
export async function notify(rows: { user_id: string; post_id: string; message: string }[]) {
    if (!rows.length) return;
    const { error } = await supabase.from("notifications").insert(rows);
    if (error) console.error("notify", error);
}
