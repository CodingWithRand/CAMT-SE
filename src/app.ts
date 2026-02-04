// Work according to the minimum requirements
// Follow the instructions & the example UI design.
// No text content modification

import express, { Request, Response } from "express";
import lodash from "lodash";
import path from "path";
import cookieParser from "cookie-parser";
import { c, connect } from "./db";
import "dotenv/config";

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
const PORT = process.env.PORT || 3000;
let posts: { id: string; title: string; body: string; likes: number }[] = [];

// Tell Express to use EJS
app.set("view engine", "ejs");

// Important: make views folder work after compiling to /dist
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  // Focusing on "blog" for now
  res.redirect("/blog");
})

// WRITE YOUR CODE HERE
app.get("/blog", async (req: Request, res: Response) => {
  let displayingPosts;
  if(req.cookies.evolve && JSON.parse(req.cookies.evolve)) {
    const queriedPosts = await c.query("SELECT BlogID, Title, Content, Likes FROM Blogs");
    displayingPosts = queriedPosts.rows.map((p) => ({
      id: p.blogid,
      title: p.title,
      body: p.content,
      likes: p.likes
    }))
  }
  else displayingPosts = posts;
  res.render("blog/home", { homeStartingContent, displayingPosts })
})
app.get("/blog/contact", (req: Request, res: Response) => {
  res.render("blog/contact", { contactContent })
})
app.get("/blog/about", (req: Request, res: Response) => {
  res.render("blog/about", { aboutContent })
})
app.get("/blog/compose", (req: Request, res: Response) => {
  res.render("blog/compose")
})
app.post("/blog/compose", async (req: Request, res: Response) => {
  // console.log(req.body);
  if(req.cookies.evolve && JSON.parse(req.cookies.evolve)) {
    // Use "CodingWithRand" user for now, until account registration is implemented
    // Also, don't forget to sanitize user input
    await c.query(`INSERT INTO Blogs (Title, Content, AuthorID) VALUES ('${req.body.postTitle}', '${req.body.postBody}', 'c9c668e7-4aa1-44bb-b75c-4c395f70b79d')`);
  } else {
    posts.push({
      id: lodash.uniqueId(),
      title: req.body.postTitle,
      body: req.body.postBody,
      likes: 0
    })
  }
  // console.log(posts)
  res.redirect("/blog")
})

app.get("/blog/post/:postName", async (req: Request, res: Response) => {
  // console.log(req.params.postName)
  // TODO: Handle 404 case
  let displayingPosts;
  if(req.cookies.evolve && JSON.parse(req.cookies.evolve)) {
    const queriedPost = await c.query(`SELECT Title, Content FROM Blogs WHERE LOWER(Blogs.Title) = LOWER('${req.params.postName?.toString()}')`);
    displayingPosts = {
      title: queriedPost.rows[0].title,
      body: queriedPost.rows[0].content
    }
  } else displayingPosts = posts.find((p) => lodash.lowerCase(p.title) === lodash.lowerCase(req.params.postName?.toString()));
  res.render("blog/post", { post: displayingPosts })
})

app.post("/blog/api/posts/:id/like", async (req: Request, res: Response) => {
  const { id } = req.params;
  if(req.cookies.evolve && JSON.parse(req.cookies.evolve)) {
    const queriedPost = await c.query(`SELECT BlogID, Likes FROM Blogs WHERE Blogs.BlogID = ${id}`);
    if(queriedPost.rows.length === 0) return res.status(404).json({ error: "Post not found" });
    const post = queriedPost.rows[0];
    post.likes += 1;
    await c.query(`UPDATE Blogs SET Likes = ${post.likes} WHERE Blogs.BlogID = ${id}`);
    return res.json({ id: post.blogid, likes: post.likes });
  } else {
    const post = posts.find(p => p.id === id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.likes += 1;
    return res.json({ id: post.id, likes: post.likes });
  }
});

app.listen(PORT, async () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`)
  await connect();
});
