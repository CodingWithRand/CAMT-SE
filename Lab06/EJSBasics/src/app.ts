import express, { Request, Response } from "express";
import path from "path";
const app = express();
const PORT = 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("/", (req: Request, res: Response) => {
  res.render("index", { title: "Home", activePage: "home" });
});
app.get("/syntax", (req: Request, res: Response) => {
  const topics = ["<%= %> output", "<% if %>", "<% forEach %>", "partials"];
  res.render("syntax", { title: "EJS Syntax", activePage: "syntax", topics });
});
type Student = { id: number; name: string; major: string };
const students: Student[] = [
  { id: 1, name: "Alice", major: "Software Engineering" },
  { id: 2, name: "Bob", major: "Data Science" },
  { id: 3, name: "Chen", major: "UX/UI" },
];
app.get("/students", (req: Request, res: Response) => {
  res.render("students", {
    title: "Students",
    activePage: "students",
    students,
  });
});
app.get("/students/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const student = students.find((s) => s.id === id);
  res.render("student-detail", {
    title: "Student Detail",
    activePage: "students",
    student,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
