import express from "express";
import path from "path";
import { addHandler, delHandler, readHandler, root, searchHandler } from "./controllers/bookController";

const app = express();
const PORT = process.env.PORT || 3000;

// TODO 5: Add middleware for HTML form + JSON + static files
// - app.use(express.urlencoded({ extended: true }));
// - app.use(express.json());
// - app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.get("/", root);

app.get("/books", readHandler);

app.post("/books/add", addHandler);
app.post("/books/delete", delHandler);
app.get("/books/search", searchHandler);

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
