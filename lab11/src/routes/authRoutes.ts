import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
const router = Router();
// Register (for lab/testing)
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  res.send({ message: "registered", userId: user._id.toString() });
});
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email });
  if (!user) return res.redirect("/login?err=invalid");
  const ok = await bcrypt.compare(password, (user as any).passwordHash);
  if (!ok) return res.redirect("/login?err=invalid");
  const token = jwt.sign(
    { userId: user._id.toString(), email },
    process.env.JWT_SECRET!,
    { expiresIn: "2h" },
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 2 * 60 * 60 * 1000,
  });
  res.redirect("/profile");
});
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect("/");
});
export default router;
