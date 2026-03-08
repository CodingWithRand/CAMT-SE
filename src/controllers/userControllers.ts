import { Request, Response } from "express";
// import { getData } from "../services/util";
import bcrypt from "bcrypt";
import { User, UserModel, UserRole } from "../models/user.model";
export const loadHome = (req: Request, res: Response) => {
  if(req.session.userId) return res.redirect(req.session.role == "admin" ? "/admin" : "/customer");
  const error =
    req.query.q === "invalid" ? "Invalid username or password" : null;

  res.render("landing-page", { error });
};
export const loginController = async (req: Request, res: Response) => {
  // const seedUsers = getData().users;
  const username = (req.body.username ?? "").toString().trim();
  const password = (req.body.password ?? "").toString();
  const user = await UserModel.findOne({ username });
  if (!user) return res.redirect("/?q=Invalid username");
  const authenticated = await bcrypt.compare(password, user.ph);
  if (!authenticated) return res.redirect("/?q=Invalid password");
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role as UserRole;
  //   route logi here
  res.redirect(user.role == "admin" ? "/admin" : "/customer");
};
export const logoutController = (req: Request, res: Response) => {
  req.session.destroy(() => res.redirect("/"));
};
