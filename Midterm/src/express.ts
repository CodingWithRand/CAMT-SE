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
import express from "express"; // Import the package
import path from "path";

const app = express(); // Setup server

// Server configs
app.use(express.static("public")); 
// Or
// app.use(express.static(path.join(__dirname, "..", "public")));

// Set the folder that server static files. (HTML, CSS, JS)
// Act like root folder for a static site project.

app.use(express.urlencoded({ extended: true })); // You need this line to be able to access form data through `req.body`
app.use(express.json()); // Received JSON text will be automatically parsed to JavaScript object.

// GET route
// When client fetch using GET method, this route will be triggered
app.get("/", (req, res) => {
    // res.send("Hello");                                               // Send TEXT response
    // res.send("<h1>Hello</h1>");                                      // Send TEXT response as HTML
    // res.json({ message: "Hello" });                                  // Send JSON response
    // res.status(404).send("<h1 style='color: red'>NOT FOUND</h1>")    // Send HTML response with HTTP status
    // res.status(404).json({ message: "Where?" });                     // Send JSON response with HTTP status
    res.redirect("/next");                                            // Redirect to another route/page
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
})

app.listen(process.env.PORT, () => console.log(`Listen to ${process.env.PORT} - http://localhost:${process.env.PORT}`));