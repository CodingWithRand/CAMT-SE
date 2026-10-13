import { Request, Response, Router } from "express";
import supabase from "../db";
import { Report } from "../model";
import { auth, optionalAuth, requireMod, uuidParam } from "../middleware";
import { MESSAGES, notify, untitled } from "../notify";
import { isMissingTable, logAction, type ModAction } from "../modlog";
import { limits } from "../rateLimit";
import { hiddenPosts } from "../hidden";

const router = Router();
router.param("pid", uuidParam);
router.param("rid", uuidParam);

const STATUSES = ["Open", "Reviewed", "Dismissed"] as const;
type Status = typeof STATUSES[number];
const MAX_REASON = 300;

// What the reporter is told once a moderator closes their report.
const REPORTER_MESSAGE: Partial<Record<Status, (title: string) => string>> = {
    Reviewed: MESSAGES.reportActioned,
    Dismissed: MESSAGES.reportDismissed,
};

/** A post's status: Open while any ticket is open, otherwise the newest ticket's status. */
function postStatus(tickets: { status: Status; created_at: string }[]): Status {
    if (tickets.some((t) => t.status === "Open")) return "Open";
    const newest = [...tickets].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    return newest?.status ?? "Open";
}

/**
 * Report status per post, for every visitor.
 * Only the status and a count are public; reasons and reporters stay with the moderators.
 * A signed-in viewer also gets which of these posts they reported themselves.
 */
router.get("/report/status", optionalAuth, async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from("reports")
        .select("post_id, user_id, status, created_at");
    if (error) throw error;

    const byPost = new Map<string, { status: Status; created_at: string; user_id: string }[]>();
    for (const r of data ?? []) {
        if (!byPost.has(r.post_id)) byPost.set(r.post_id, []);
        byPost.get(r.post_id)!.push(r);
    }
    const statuses = [...byPost].map(([post_id, tickets]) => ({
        post_id,
        status: postStatus(tickets),
        report_count: tickets.length,
        reported_by_me: !!req.userId && tickets.some((t) => t.user_id === req.userId),
    }));
    res.status(200).json(statuses);
});

/** Every ticket with its post title and reporter name, for the moderator queue. */
router.get("/report/fetch", auth, requireMod, async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from("reports")
        .select("*, post:posts(id, title, content), reporter:users!reports_user_id_fkey(display_name)")
        .order('created_at', { ascending: true });
    if (error) throw error;
    const hidden = await hiddenPosts();
    res.status(200).json((data ?? []).map((r) => ({ ...r, post_hidden: hidden.has(r.post_id) })));
});

/** The signed-in user's own reports with their status, for the profile page. */
router.get("/report/mine", auth, async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from("reports")
        .select("id, post_id, reason, status, created_at, reviewed_at, post:posts(title)")
        .eq("user_id", req.userId!)
        .order("created_at", { ascending: false });
    if (error) throw error;
    res.status(200).json((data ?? []).map(({ post, ...r }: any) => ({ ...r, title: post?.title ?? null, post_deleted: !post })));
});

/** Moderator display names by id, in one query. */
async function namesOf(ids: string[]) {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) return new Map<string, string>();
    const { data, error } = await supabase.from("users").select("id, display_name").in("id", unique);
    if (error) throw error;
    return new Map((data ?? []).map((u) => [u.id, u.display_name as string]));
}

/**
 * Before moderation_log exists: rebuild what we can from the reports and posts tables —
 * the latest decision per report (one entry per post and decision) and posts still hidden.
 */
async function derivedHistory() {
    const [reports, hidden] = await Promise.all([
        supabase.from("reports").select("post_id, status, reviewed_by, reviewed_at, post:posts(title)")
            .not("reviewed_by", "is", null).neq("status", "Open"),
        supabase.from("posts").select("id, title, hidden_by, hidden_at, hidden_reason").eq("is_hidden", true).not("hidden_by", "is", null),
    ]);
    if (reports.error) throw reports.error;
    if (hidden.error) throw hidden.error;

    const decisions = new Map<string, any>();
    for (const r of (reports.data ?? []) as any[]) {
        const key = `${r.post_id}|${r.status}|${r.reviewed_by}|${r.reviewed_at}`;
        const d = decisions.get(key);
        if (d) { d.count++; continue; }
        decisions.set(key, { action: r.status === "Reviewed" ? "report_reviewed" : "report_dismissed", post_id: r.post_id, post_title: r.post?.title ?? null, actor_id: r.reviewed_by, created_at: r.reviewed_at, count: 1 });
    }
    return [
        ...[...decisions.values()].map(({ count, ...d }) => ({ ...d, detail: `${count} รายงาน` })),
        ...(hidden.data ?? []).map((p) => ({ action: "post_hidden", post_id: p.id, post_title: p.title, actor_id: p.hidden_by, created_at: p.hidden_at, detail: p.hidden_reason })),
    ].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

/**
 * Moderation history, newest first, from moderation_log (every action). Until
 * api/sql/2026-10-13_moderation_log.sql has run, a reconstruction (`complete: false`).
 */
router.get("/report/history", auth, requireMod, async (_req: Request, res: Response) => {
    const LIMIT = 300;
    let complete = true;
    let rows: any[];
    const { data, error } = await supabase.from("moderation_log").select("*").order("created_at", { ascending: false }).limit(LIMIT);
    if (error && !isMissingTable(error)) throw error;
    if (error) { complete = false; rows = (await derivedHistory()).slice(0, LIMIT); }
    else rows = data ?? [];

    const name = await namesOf(rows.map((r) => r.actor_id));
    res.status(200).json({
        complete,
        entries: rows.map((r) => ({
            action: r.action, post_id: r.post_id ?? null, post_title: r.post_title ?? null, target_id: r.target_id ?? null,
            detail: r.detail ?? null, at: r.created_at, by: r.actor_id, by_name: name.get(r.actor_id) ?? "ไม่ทราบชื่อ",
        })),
    });
});

router.post("/report/createticket", auth, limits.report, async (req: Request, res: Response) => {
    const post_id = String(req.body?.post_id ?? "");
    const reason = String(req.body?.reason ?? "").trim();
    if (!post_id) return res.status(400).json({ message: "post_id is required" });
    if (!reason || reason.length > MAX_REASON) {
        return res.status(400).json({ message: `reason is required (max ${MAX_REASON} characters)` });
    }

    // The reporter is whoever is signed in, never a user_id taken from the request body.
    const reportData: Report = { post_id, user_id: req.userId!, reason, status: "Open" };
    const { data: post, error: postError } = await supabase.from("posts").select("id").eq("id", post_id).maybeSingle();
    if (postError) throw postError;
    if (!post) return res.status(404).json({ message: "Post not found" });

    // One open report per person per post; they can report again once it has been closed.
    const { data: existing, error: existingError } = await supabase
        .from("reports")
        .select("id")
        .eq("post_id", post_id)
        .eq("user_id", req.userId!)
        .eq("status", "Open")
        .limit(1);
    if (existingError) throw existingError;
    if (existing?.length) return res.status(409).json({ message: "You already reported this post" });

    // INSERT INTO reports (post_id, user_id, reason, status) VALUES (pid, uid, reason, status);
    const { data, error } = await supabase
        .from("reports")
        .insert(reportData)
        .select()
        .single();
    if (error) throw error;
    res.status(201).json(data);
});

/**
 * Set the status of every ticket on a post (a moderator reviews the post, not single tickets),
 * then tell each reporter what came of it.
 */
router.put("/report/post/:pid/status", auth, requireMod, async (req: Request, res: Response) => {
    const { pid } = req.params;
    const status = req.body?.status as Status;
    if (!STATUSES.includes(status)) return res.status(400).json({ message: `status must be one of ${STATUSES.join(", ")}` });

    const { data: tickets, error } = await supabase
        .from("reports")
        .update({ status, reviewed_by: req.userId, reviewed_at: new Date() })
        .eq("post_id", pid)
        .select("user_id, post:posts(title)");
    if (error) throw error;
    if (!tickets?.length) return res.status(404).json({ message: "No reports for this post" });

    const message = REPORTER_MESSAGE[status];
    if (message) {
        const title = untitled((tickets[0] as any).post?.title);
        const reporters = [...new Set(tickets.map((t) => t.user_id))];
        await notify(reporters.map((user_id) => ({ user_id, post_id: String(pid), message: message(title) })));
    }

    const action: Record<Status, ModAction> = { Open: "report_reopened", Reviewed: "report_reviewed", Dismissed: "report_dismissed" };
    await logAction(req.userId!, action[status], {
        post_id: String(pid), post_title: (tickets[0] as any).post?.title, detail: `${tickets.length} รายงาน`,
    });
    res.status(200).json({ post_id: pid, status, updated: tickets.length });
});

// Single-ticket version, kept for existing callers.
router.put("/report/review/:rid", auth, requireMod, async (req: Request, res: Response) => {
    const { rid } = req.params;
    const status = req.body?.status as Status;
    if (!STATUSES.includes(status)) return res.status(400).json({ message: `status must be one of ${STATUSES.join(", ")}` });

    // UPDATE reports SET status = status WHERE id = rid;
    const { error } = await supabase
        .from("reports")
        .update({ status, reviewed_by: req.userId, reviewed_at: new Date() })
        .eq("id", rid)
        .select();
    if (error) throw error;
    res.status(200).send();
})

export default router;
