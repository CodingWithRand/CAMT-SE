// Step 4: Protect routes with middleware
import { Request, Response, NextFunction } from "express";
export function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.redirect("/?q=need-login");
  next();
}
