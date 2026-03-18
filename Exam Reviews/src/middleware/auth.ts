import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Session-based auth, check data in the session store if user is authenticated; user's data present or not.
export function sessionbase_auth_check(req: Request, res: Response, next: NextFunction) {
    if(!req.session!.username) return res.redirect("/auth/login");
    next()
}

// JWT-based auth
export function jwt_auth_check(req: Request, res: Response, next: NextFunction) {
    // Receive token from authorization header
    // const token = req.headers?.authorization?.slice("Bearer ".length) as string | undefined;
    // Receive token from cookie
    const token = req.cookies?.token as string | undefined;
    if(!token) return res.redirect("/auth/login");
    jwt.verify(
        token, // Input token
        process.env.SECRET!, // Secret to verify signed token
        (err, decoded) => {
            if(err) return res.redirect("/auth/login");
            const payload = decoded as JwtPayload & { username: string };
            req.username = payload.username;
            next();
        } // What to do after the verification.
    )
}