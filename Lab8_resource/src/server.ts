import express, { Request, Response } from "express";
import path from "path";
import { addBook, Book, delBook, readBooks } from "./services/bookFileDb";

const app = express();
const PORT = process.env.PORT || 3000;

// TODO 5: Add middleware for HTML form + JSON + static files
// - app.use(express.urlencoded({ extended: true }));
// - app.use(express.json());
// - app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req: Request, res: Response) => {
  // TODO 6: Send public/index.html
  // Hint: res.sendFile(path.join(process.cwd(), "public", "index.html"));
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/books", (req: Request, res: Response) => {
  // TODO 7: Return all books as JSON
  // Hint: const books = readBooks(); return res.json(books);

  const books = readBooks();
  return res.json(books);
});

app.post("/books/add", (req: Request, res: Response) => {
  try {
    // TODO 8: Read bookName from req.body.bookName and validate (trim it)
    // If empty -> return res.status(400).send("bookName is required");

    // TODO 9: Call addBook(bookName)

    // TODO 10: Redirect to "/" after success
    // Hint: return res.redirect("/");
 
    const { bookName } = req.body;
    if (!bookName || bookName.trim() === "") return res.status(400).send("Book name cannot be empty");
    addBook(bookName);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});
app.post("/books/delete", (req: Request, res: Response) => {
  try {
    const { bookName } = req.body;
    if (!bookName || bookName.trim() === "") return res.status(400).send("Book name cannot be empty");
    delBook(bookName);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    if((err as Error).message === "Book not found") return res.status(404).send("Book not found");
    return res.status(500).send("Server error");
  }
});
app.post("/books/search", (req: Request, res: Response) => {
  const books: Book[] = readBooks();
  const { bookName } = req.body;
  const searchedBook: Book[] = [];
  books.forEach(b => {
    if(b.bookName.match(new RegExp(`(${bookName})`, "gi"))) searchedBook.push(b);
  })
  res.json(searchedBook)
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
