import { Request, Response, NextFunction } from "express";

/**
 * Per-user rate limit for writes (in memory: resets when the API restarts, and counts per
 * API process). Goes after `auth`. Answers 429 with `retry_after` seconds.
 */
export function rateLimit(name: string, max: number, windowMs = 60_000) {
    const hits = new Map<string, number[]>();
    return (req: Request, res: Response, next: NextFunction) => {
        const key = req.userId ?? req.ip ?? "anon";
        const now = Date.now();
        const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
        if (recent.length >= max) {
            const retry_after = Math.ceil((windowMs - (now - recent[0]!)) / 1000);
            res.setHeader("Retry-After", String(retry_after));
            return res.status(429).json({ code: "rate_limited", message: `Too many ${name} requests; try again in ${retry_after}s`, retry_after });
        }
        recent.push(now);
        hits.set(key, recent);
        // Drop users who went quiet, so the map does not grow forever.
        if (hits.size > 5000) for (const [k, v] of hits) if (now - (v[v.length - 1] ?? 0) > windowMs) hits.delete(k);
        next();
    };
}

export const limits = {
    post: rateLimit("post", 5),
    comment: rateLimit("comment", 20),
    report: rateLimit("report", 10),
    react: rateLimit("reaction", 60),
};
