import express, { Request, Response } from "express";
const app = express();
const port = 3000;
// Simple route
app.get("/hello", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript! ");
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
