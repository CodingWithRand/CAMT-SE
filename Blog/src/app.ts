// Work according to the minimum requirements
// Follow the instructions & the example UI design.
// No text content modification

import express, { Request, Response } from "express";
import lodash from "lodash";
import path from "path";

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
const PORT = 3000;
let posts: { id: string; title: string; body: string; likes: number }[] = [];

// Tell Express to use EJS
app.set("view engine", "ejs");

// Important: make views folder work after compiling to /dist
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

// WRITE YOUR CODE HERE
app.get("/", (req: Request, res: Response) => {
  res.render("home", { homeStartingContent, posts })
})
app.get("/contact", (req: Request, res: Response) => {
  res.render("contact", { contactContent })
})
app.get("/about", (req: Request, res: Response) => {
  res.render("about", { aboutContent })
})
app.get("/compose", (req: Request, res: Response) => {
  res.render("compose")
})
app.post("/compose", async (req: Request, res: Response) => {
  // console.log(req.body);
  posts.push({
    id: lodash.uniqueId(),
    title: req.body.postTitle,
    body: req.body.postBody,
    likes: 0
  })
  // console.log(posts)
  res.redirect("/")
})

app.get("/post/:postName", (req: Request, res: Response) => {
  // console.log(req.params.postName)
  res.render("post", { 
    post: posts.find((p) => lodash.lowerCase(p.title) === lodash.lowerCase(req.params.postName?.toString()))
  })
})

app.post("/api/posts/:id/like", (req, res) => {
  const { id } = req.params;
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  post.likes += 1;
  return res.json({ id: post.id, likes: post.likes });
});

app.listen(PORT, async () => {
  const open = await import('open');
  open.default(`http://localhost:${PORT}`);
  console.log(`Server is listening on port ${PORT}`);
});
