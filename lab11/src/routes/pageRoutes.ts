import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
const router = Router();
router.get("/", (req: Request, res: Response) => res.render("home"));
router.get("/login", (req: Request, res: Response) => {
  const err = req.query.err;
  res.render("login", { err });
});
router.get("/profile", requireAuth, (req: Request, res: Response) => {
  res.render("profile", { user: (req as any).user });
});
export default router;
