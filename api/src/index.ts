import express, { Request, Response, NextFunction } from 'express';
import supabase from "./db";
import cors from 'cors';

// Routes
import comment from './endpoints/comment';
import post from './endpoints/post';
import user from './endpoints/user';
import report from './endpoints/report';
import misc from './endpoints/misc';
import notification from './endpoints/notification';
import admin from './endpoints/admin';
import { broadcast, LiveTopic } from './live';

const app = express();
const PORT = 3030;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({
    origin: 'http://localhost:3000'
}))

// After every successful write, tell open browsers what to re-fetch (see live.ts).
const LIVE_TOPICS: [RegExp, LiveTopic[]][] = [
    [/^\/post\/create/, ["posts", "notifications"]],          // announcements notify followers
    [/^\/post\/[^/]+\/react/, ["posts"]],
    [/^\/post\//, ["posts", "reports", "notifications"]],     // edit, hide, unhide, delete
    [/^\/comment\//, ["comments"]],
    [/^\/report\//, ["reports", "notifications"]],           // closing a report notifies the reporters
    [/^\/admin\/categories/, ["categories", "posts"]],       // a renamed category shows on posts
    [/^\/admin\/users/, ["roles"]],                          // the user whose role changed updates at once
];
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
        res.on("finish", () => {
            if (res.statusCode >= 300) return;
            const topics = LIVE_TOPICS.find(([re]) => re.test(req.path))?.[1];
            // /comment/<post id> and /comment/<post id>/replyto/<comment id> name the post.
            const postId = /^\/comment\/([0-9a-f-]{36})(\/replyto\/|$)/i.exec(req.path)?.[1];
            if (topics) broadcast(topics, postId);
        });
    }
    next();
});

app.use("/", post);
app.use("/", comment);
app.use("/", user);
app.use("/", report);
app.use("/", misc);
app.use("/", notification);
app.use("/", admin);

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
    console.log("http://localhost:3030");
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

// ⏰ is postponed until the team decide on the following. [DECIDED ON EVERYTHING]
// 1. Is the report reviewer really matter? Projection: Reviewer is highly unlikely to be necessary.
// 2. Do we make the title field separately when creating a post? (Now, the title is the first line of the post content.) Projection: Highly likely to add title field.
// 3. Does the search render real-time on what is actually on the frontend? Projection: idk.
// Like, do we match the keyword in the search box to any component of the post, if at least one match, show the post. The post only included the rendered/fetched one from the database and saved state on the frontend.
// The search happen every time the keyword changes.