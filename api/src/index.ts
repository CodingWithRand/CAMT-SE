import express, { Request, Response, NextFunction } from 'express';
import supabase from "./db";

// Routes
import comment from './endpoints/comment';
import post from './endpoints/post';
import user from './endpoints/user';
import report from './endpoints/report';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("*splat", async (req: Request, res: Response, next: NextFunction) => {
    // headers -> authorization: "Bearer <token>"
    const access_token = req.headers.authorization?.split(" ")[1];
    const user = await supabase.auth.getUser(access_token)
    if(user && user.data.user) {
        req.user = user.data.user;
        req.userId = user.data.user.id;
        next();
    } else {
        res.status(401).json({ message: "Unauthorized request" });
    }
})

app.use("/", comment);
app.use("/", post);
app.use("/", user);
app.use("/", report);

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
    console.log("http://localhost:3000");
})

// TODO next [DOEN]
// ref: https://docs.google.com/document/d/1oVw5Aye5lyN4SM1tOYNALk6woh0ijekHbnupKLw7Pyg/edit?tab=t.0
// UserInterest table ✅
// Comment create, get ✅
// Report table create, update and get ticket ✅
// Notification table get ✅

// TODO next
// Announcement create trigger notification to every user. ✅
// System randomly pick a review from the mod user pool (considering not implementing it ✅). ⏰
// Post search fetch ⏰
// Post that match user interest category fetch. ⏰

// ⏰ is postponed until the team decide on the following.
// 1. Is the report reviewer really matter? Projection: Reviewer is highly unlikely to be necessary.
// 2. Do we make the title field separately when creating a post? (Now, the title is the first line of the post content.) Projection: Highly likely to add title field.
// 3. Does the search render real-time on what is actually on the frontend? Projection: idk.
// Like, do we match the keyword in the search box to any component of the post, if at least one match, show the post. The post only included the rendered/fetched one from the database and saved state on the frontend.
// The search happen every time the keyword changes.