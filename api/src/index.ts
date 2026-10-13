import express from 'express';
import cors from 'cors';

// Routes
import comment from './endpoints/comment';
import post from './endpoints/post';
import user from './endpoints/user';
import report from './endpoints/report';
import misc from './endpoints/misc';
import notification from './endpoints/notification';
import admin from './endpoints/admin';
import { liveUpdates } from './live';
import { errorHandler } from './middleware';

const app = express();
const PORT = Number(process.env.PORT ?? 3030);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(liveUpdates);

app.use("/", post);
app.use("/", comment);
app.use("/", user);
app.use("/", report);
app.use("/", misc);
app.use("/", notification);
app.use("/", admin);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
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