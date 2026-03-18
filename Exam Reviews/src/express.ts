/* 
    Express
    • A popular javascript library/framework for Node.js web server.
    • Key features: routing, middleware, request/response handling
    • Can return HTML pages or JSON (API)

    EJS

    Project structure (Recommended)
    public/            # Static files
    views/             # EJS templates
    - partials/        # EJS partial templates
    src/               # Source code
    - models/          # Declare types here
    - services/        # Modules
    - data/            # Your JSON here
    - server.ts        # Main code
    .env               # Environment variables, something secret e.g. API key

    NEVER PUBLISH .env OR PUT STUFF IN .env ON THE FRONTEND!
*/

import "dotenv/config"; // Initialize environment variables that you defined in .env, so you can access them in process.env
/**
 * The following works too
 * @code
 * ```js
 * import dotenv from "dotenv";
 * dotenv.config();
 * ```
 * @endcode
 */
import express from "express"; // Import the package
import path from "path";
import { addTower, login_page, sessionbase_login, showTowers, showStories, sessionbase_logout, addStory, jwt_login, jwt_logout } from "./controllers/testcontroller";
import session from "express-session";
import { jwt_auth_check, sessionbase_auth_check } from "./middleware/auth";
import cookieParser from "cookie-parser";

const app = express(); // Setup server

// Server configs
app.use(express.static("public")); 
// Or
// app.use(express.static(path.join(__dirname, "..", "public")));

// Set the folder that server static files. (HTML, CSS, JS)
// Act like root folder for a static site project.

app.use(express.urlencoded({ extended: true })); // You need this line to be able to access form data through `req.body`
app.use(express.json()); // Received JSON text will be automatically parsed to JavaScript object.

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cookieParser())

/** 
 * Authentication - Session-based
 * 
 * How it works?
 * 1. User login, credentials send to server
 * 2. Verify credentials in the server database (JSON in this case)
 * 3. If credentials are valid, add them to the session store in the server and create a unique session ID for user to access that session store.
 * 4. The session ID is sent to the client in a cookie.
 * 5. Next time the user make a request, e.g. refreshing the page, the cookie will be sent to server
 * 6. Server will check if session ID is valid in the session store, if it is valid, the user is authenticated
 * 
 * Note: Session ID is "signed".
 * 
 * Pros - easy to revoke, sensitive data on server.
 * Cons - need session store, maybe harder to scale.
 */
function sessionbaseauth() {
    app.use(session({
        secret: process.env.SECRET!, // Secret to sign session ID (I should have put it in .env, yeah ok will do that)
        resave: false,  // Only save when data in session store is modified
        saveUninitialized: false, // Don't save empty sessions
        cookie: {
            httpOnly: true,  // Only server can access
            sameSite: "lax", // Protect CSFR
            maxAge: 60 * 1000 // The cookie only alive for 1 minutes, then session ID becomes invalid
            // secure: true // Use only HTTPS
        }
    }))
    // Session-based Auth
    app.get("/auth/protected", sessionbase_auth_check, showStories);

    app.post("/auth/login", sessionbase_login);
    app.post("/auth/logout", sessionbase_logout);
};

/** JWT-based auth
 * 
 * Similar to session-based, user send credentials, get verified.
 * But instead of producing session ID and storing credentials in session store to compare later in next requests,
 * Access token is created and sent to client, often through authorization header.
 * Token format: Bearer \<token\>. -> Bearer \<Headers.Payload.Signature\>
 * For next requests, this token will be sent through authorization header/cookie for the server to verify.
 * 
 * JWT is "Signed", meaning the data in payload is readable by anyone. SO, DON'T INCLUDE SENSITIVE DATA IN IT!
 * - Pros - Stateless -> Scalable. Good for APIs, SPA, microservices
 * - Cons - Harder to revoke immediately
 */
function jwtbaseauth() {
    app.get("/auth/protected", jwt_auth_check, showStories);
    app.post("/auth/login", jwt_login);
    app.post("/auth/logout", jwt_logout);
}

sessionbaseauth();
// jwtbaseauth();

// GET route
// When client fetch using GET method, this route will be triggered
app.get("/", (req, res) => {
    // res.send("Hello");                                               // Send TEXT response
    // res.send("<h1>Hello</h1>");                                      // Send TEXT response as HTML
    // res.json({ message: "Hello" });                                  // Send JSON response
    // res.status(404).send("<h1 style='color: red'>NOT FOUND</h1>")    // Send HTML response with HTTP status
    // res.status(404).json({ message: "Where?" });                     // Send JSON response with HTTP status
    // res.redirect("/next");                                           // Redirect to another route/page
    res.send(`
        <a href="/next">Example express implemenation</a><br>
        <a href="/mvc">Example MVC implemenation</a><br>
        <a href="/auth/login">Example auth implemenation</a><br>
    `)
})

app.get("/next", (req, res) => {
    res.send(`
        <h1>Check if this Roblox UID exists on Roblox</h1>
        <form method="post" action="/next">
            <label for="uid">Roblox UID</label>
            <input name="uid" type="text" placeholder="Roblox UID">
            <button type="submit">Check</button>
        </form>
    `)
})

// POST route
// When client fetch using POST method, this route will be triggered
app.post("/next", async (req, res) => {
    const uid: number = req.body.uid;
    try {
        const somekindofresponse = await fetch(`https://cwr-api-us.onrender.com/get/roblox/users/exist/${uid}`);
        if(!somekindofresponse.ok) throw new Error(`HTTP ${somekindofresponse.status}`);
        const somekindofdata = await somekindofresponse.json();
        res.status(200).json(somekindofdata);
    } catch (e: any) {
        res.status(400).json({ message: `Error fetching data ${e.message}` });
    }
});

// EJS - As this topic is already covered in midterm, I assume you already know about it and how to use it.
// So, skip this (You'll see the code in the implementation in other topic anyway.)

/** MVC (Model-View-Controller) Architecture
  * Workflow: 
  * - User makes requests to server, triggering routes handler function (Controller)
  * - Controller functions interact with data, processing it according to the user requests and logic, e.g. update/read data in database.
  * - Model defines the data structure and methods to deal with it, e.g. User, TodoItem, read/write functions, etc.
  * - Output data is rendered to user on UI. (View)
  * Simple MVC is just organizing code to have route handler functions implemented in different files, specifically in "controllers" folder.
  * This reduces code coupling. You don't have to make changes in "index.ts" when the logic is changed.
  * "index.ts" will be just wired routers and middleware setups.
  * As an example code below, you just plug in imported functions when defining a route.
  * @code
  * ```js
  * app.get("/", middleware, main);
  * ```
  * @endcode
  * 
  * Structure
  * ```
  * src
  * |- controllers/
  * |- middlewares/
  * |- models/
  * |- services/
  * |- views/
  * |_ index.ts
  * ```
  * 
  * Note: 
  * - `services` folder can be a part of Model as it contains the additional logic about the way to deal with data.
  * - `views` this can be outside src btw.
  */

function mvc() {
    app.get("/mvc", showTowers);
    app.post("/mvc/tower/add", addTower)
}

mvc()

app.post("/mvc/story/add", addStory)
app.get("/auth/login", login_page);


app.listen(process.env.PORT, () => console.log(`Listen to ${process.env.PORT} - http://localhost:${process.env.PORT}`));