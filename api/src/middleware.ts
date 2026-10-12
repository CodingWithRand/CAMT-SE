import { Request, Response, NextFunction } from "express";
import supabase from "./db";

export async function auth(req: Request, res: Response, next: NextFunction) {
    // headers -> authorization: "Bearer <token>"
    const access_token = req.headers.authorization?.split(" ")[1];
    const user = await supabase.auth.getUser(access_token)
    if(user && user.data.user) {
        req.user = user.data.user;
        req.userId = user.data.user.id;
        next();
    } else {
        res.status(401).json({ message: "Unauthorized request" });
    }
}

/**
 * Attach the user when a usable token is sent, but let the request through either way.
 *
 * Reading posts and comments stays open to logged-out visitors, yet a signed-in
 * reader still needs to see which reactions are their own — so these routes want
 * the identity when it is available and no 401 when it is not.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
    const access_token = req.headers.authorization?.split(" ")[1];
    if (!access_token) return next();
    try {
        const user = await supabase.auth.getUser(access_token);
        if (user?.data?.user) {
            req.user = user.data.user;
            req.userId = user.data.user.id;
        }
    } catch {
        // An expired or malformed token just means "treat them as logged out".
    }
    next();
}