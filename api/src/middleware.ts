import { Request, Response, NextFunction } from "express";
import supabase from "./db";
import { getUserData } from "./users";

async function userFromToken(req: Request) {
    // headers -> authorization: "Bearer <token>"
    const access_token = req.headers.authorization?.split(" ")[1];
    if (!access_token) return null;
    const { data } = await supabase.auth.getUser(access_token);
    return data?.user ?? null;
}

export async function auth(req: Request, res: Response, next: NextFunction) {
    const user = await userFromToken(req);
    if (!user) return res.status(401).json({ message: "Unauthorized request" });
    req.user = user;
    req.userId = user.id;
    next();
}

/**
 * Attach the user when a usable token is sent, but let the request through either way.
 *
 * Reading posts and comments stays open to logged-out visitors, yet a signed-in
 * reader still needs to see which reactions are their own — so these routes want
 * the identity when it is available and no 401 when it is not.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
    try {
        const user = await userFromToken(req);
        if (user) {
            req.user = user;
            req.userId = user.id;
        }
    } catch {
        // An expired or malformed token just means "treat them as logged out".
    }
    next();
}

export async function isModerator(userId: string | undefined) {
    return !!userId && !!(await getUserData(userId)).is_mod;
}

/** Goes after `auth`: moderators only. */
export async function requireMod(req: Request, res: Response, next: NextFunction) {
    if (!(await isModerator(req.userId))) return res.status(403).json({ message: "Moderators only." });
    next();
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** router.param handler: a malformed id in the path is a 400, not a Postgres error turned into a 500. */
export function uuidParam(req: Request, res: Response, next: NextFunction, value: string) {
    if (!UUID.test(String(value))) return res.status(400).json({ message: "Invalid id" });
    next();
}

/**
 * Express 5 sends a rejected async handler here, so routes just throw (Supabase errors included)
 * instead of each wrapping itself in try/catch.
 */
export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
    console.error(error);
    if (res.headersSent) return;
    res.status(500).json({ code: error?.code, message: error?.message });
}
