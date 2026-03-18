// Controller file. The logic for how to work with data when user made a request is implemented here.
import { getAllStory, getAllTower, getFilteredTower, getOneUser, init, read, write } from "../services/jsondb";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
init();

export function addTower(req: Request, res: Response) {
    const { name, acronym, floorCount, difficulty } = req.body;
    const db = read();
    if(!db.towers) db.towers = [];
    const priorTowers = getAllTower() || db.towers;
    priorTowers.push({ name, acronym, floorCount, difficulty });
    db.towers = priorTowers
    write(db);
    res.redirect("/mvc");
}

export function showTowers(req: Request, res: Response) {
    const { search } = req.query;
    let towers;
    if(search) towers = getFilteredTower(search as string);
    else towers = getAllTower();
    res.render("mvcmain", { towers })
}

export function addStory(req: Request, res: Response) {
    const db = read();
    if(!db.stories) db.stories = [];
    const priorStories = getAllStory() || db.stories;
    priorStories.push({
        ...req.body,
        publishDate: new Date().toDateString() 
    });
    db.stories = priorStories;
    write(db);
    res.redirect("/auth/protected");
}

export function showStories(req: Request, res: Response) {
    res.render("protected", { stories: getAllStory(), username: req.session?.username || req.username })
}

export function login_page(req: Request, res: Response) {
    res.render("login", { error: req.query.error });
}

// Session-based Auth

// First, match credentials with ones in database
// If matched, create a session holding user's data (non-sensitive), which store in the server, and redirect to protected page
// Otherwise, user stuck on login page
export function sessionbase_login(req: Request, res: Response) {
    const { username, password } = req.body;
    const user = getOneUser(username, password);
    if(user.length === 0) return res.redirect("/auth/login?error=Invalid username or password");
    req.session!.username = username;
    res.redirect("/auth/protected");
}
// Logout, destroy session.
export function sessionbase_logout(req: Request, res: Response) {
    req.session?.destroy(() => res.redirect("/auth/login"));
}

export function jwt_login(req: Request, res: Response) {
    const { username, password } = req.body;
    const user = getOneUser(username, password);
    if(user.length === 0) return res.redirect("/auth/login?error=Invalid username or password");
    const token = jwt.sign(
        { username }, // Identity data to include in payload. DON'T INCLUDE SENSITIVE DATA
        process.env.SECRET!, // Secret to sign token
        { expiresIn: "1m" }, // Life time
    )

    // You have to find a way to pass the created cookie to client.
    // Then, with client-side-stored token, user can use that token to pass it back to server to verify in the next requests.
    // 2 ways to do: Cookie/Authorization Header

    res.cookie("token", token, { expires: new Date(Date.now() + (60 * 1000)) });
    res.redirect("/auth/protected");
}

// I can't find a "simple" way to do this unfortunately :'(
// So here you go, just redirect back to login page lelz

// Nvm, I think I may find a way. As I put the token in cookie, simply just destroy the cookie. Easy innit?
export function jwt_logout(req: Request, res: Response){
    res.clearCookie("token");
    res.redirect("/auth/login");
}