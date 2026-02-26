
import { Request, Response } from "express";
import { todoItems, addTodo, deleteTodo } from "../data/seed";

export function main(req: Request, res: Response) {
  res.render("list", { items: todoItems, username: req.session.username, listTitle: "Today" });
}

export function add(req: Request, res: Response) {
  const name = (req.body.newItem ?? "").toString().trim();
  if (name) addTodo(name);
  res.redirect("/todos");
}

export function del(req: Request, res: Response) {
  const id = Number(req.body.checkbox);
  if (!Number.isNaN(id)) deleteTodo(id);
  res.redirect("/todos");
}