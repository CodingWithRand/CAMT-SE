import { Request, Response } from "express";
import { addBook, delBook, readBooks } from "../services/fileDb";
import { Book } from "../models/Book";

export async function root(req: Request, res: Response) {
  // TODO 6: Send public/index.html
  // Hint: res.sendFile(path.join(process.cwd(), "public", "index.html"));
  res.render("index");
}

export function readHandler(req: Request, res: Response) {
  // TODO 7: Return all books as JSON
  // Hint: const books = readBooks(); return res.json(books);

  const books = readBooks();
  return res.render("books", { books });
}

export function addHandler(req: Request, res: Response) {
  try {
    // TODO 8: Read bookName from req.body.bookName and validate (trim it)
    // If empty -> return res.status(400).send("bookName is required");

    // TODO 9: Call addBook(bookName)

    // TODO 10: Redirect to "/" after success
    // Hint: return res.redirect("/");
 
    const { bookName } = req.body;
    if (!bookName || bookName.trim() === "") return res.status(400).send("Book name cannot be empty");
    addBook(bookName);
    res.redirect("/books");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
}

export function delHandler(req: Request, res: Response) {
  try {
    const { bookName } = req.body;
    if (!bookName || bookName.trim() === "") return res.status(400).send("Book name cannot be empty");
    delBook(bookName);
    res.redirect("/books");
  } catch (err) {
    console.error(err);
    if((err as Error).message === "Book not found") return res.status(404).send("Book not found");
    return res.status(500).send("Server error");
  }
}

export function searchHandler(req: Request, res: Response) {
  const books: Book[] = readBooks();
  const { name } = req.query;
  const searchedBook: Book[] = [];
  books.forEach(b => {
    if(b.bookName.match(new RegExp(`(${name})`, "gi"))) searchedBook.push(b);
  })
  res.render("books", { books: searchedBook });
}