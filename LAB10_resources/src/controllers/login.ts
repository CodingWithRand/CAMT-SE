import { Request, Response } from "express";
import { seedUsers } from "../data/seed";

export function home(req: Request, res: Response) {
  const error = req.query.q === "invalid" ? "Invalid username or password" : undefined;
  res.render("index", { error });
}

export function login(req: Request, res: Response) {
  const username = (req.body.username ?? "").toString().trim();
  const password = (req.body.password ?? "").toString();
  const user = seedUsers.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) return res.redirect("/?q=invalid");
  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect("/todos");
}

export function logout(req: Request, res: Response) {
  req.session.destroy(() => res.redirect("/"));
}