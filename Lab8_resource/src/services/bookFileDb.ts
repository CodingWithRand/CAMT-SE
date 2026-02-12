import fs from "fs";
import path from "path";

export type Book = {
  bookNo: number;
  bookName: string;
};

type DbShape = { books: Book[] };

const dbPath = path.join(process.cwd(), "data", "books.json");

// TODO 1: Implement readDb(): DbShape
// - If file not found: create data folder + books.json with { books: [] }
// - Read file text (utf-8) and JSON.parse
function readDb(): DbShape {
  // TODO 1
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.join(process.cwd(), "data"));
    fs.writeFileSync(dbPath, JSON.stringify({ books: [] }, null, 2), "utf-8");
  }
  const file = fs.readFileSync(dbPath, "utf-8");
  const data = JSON.parse(file);

  return data; 
}

// TODO 2: Implement writeDb(db: DbShape)
// - JSON.stringify(db, null, 2) and writeFileSync utf-8
function writeDb(db: DbShape) {
  // TODO 2
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export function readBooks(): Book[] {
  // TODO 3: return readDb().books
  return readDb().books; // TODO 3
}

export function addBook(bookName: string): Book {
  // TODO 4:
  // - read db
  // - find max bookNo
  // - create newBook { bookNo: max+1, bookName }
  // - push, write db
  // - return newBook
  if(!bookName || bookName.trim() === "") throw new Error("Book name cannot be empty");
  const existingDb = readDb();
  const maxBookNo = existingDb.books.length
  const newBook = { bookNo: maxBookNo + 1, bookName };
  existingDb.books.push(newBook)
  writeDb(existingDb);
  return newBook; // TODO 4
}


// Challenge
export function delBook(bookName: string): void {
  if(!bookName || bookName.trim() === "") throw new Error("Book name cannot be empty");
  const existingDb = readDb();
  let delBookReqI: number;
  do {
    delBookReqI = existingDb.books.findIndex(b => b.bookName === bookName)
    if(delBookReqI === -1) throw new Error("Book not found");
    existingDb.books.splice(delBookReqI, 1);
    existingDb.books = existingDb.books.map((b) => ({ bookNo: b.bookNo > delBookReqI + 1 ? b.bookNo - 1 : b.bookNo, bookName: b.bookName }));
    delBookReqI = existingDb.books.findIndex(b => b.bookName === bookName)
  } while(delBookReqI !== -1);
  writeDb(existingDb);
}