// This file contains methods that manipulate JSON data file -> Read/Write. (Part of "Model")
import fs from "fs";
import path from "path";
import { Tower } from "../models/towers";
import { User } from "../models/user";

export function init() {
    // Check for data folder and json file with fs.existsSync
    // process.cwd() returns the current working directory (The directory that the Node.js process is running -> src/ in this case)
    // fs.mkdirSync create folder with the provided path and name
    // fs.writeFileSync write data into the target file.
    if(!fs.existsSync(path.join(process.cwd(), "../data"))) fs.mkdirSync(path.join(process.cwd(), "../data"));
    if(!fs.existsSync(path.join(process.cwd(), "../data", "db.json"))) fs.writeFileSync(path.join(process.cwd(), "../data", "db.json"), JSON.stringify({}));
}

export function read() {
    // fs.readFileSync read data from the target file in String format. To use data, it needed to be parsed first.
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "../data", "db.json"), "utf-8"));
}

export function write(data: any) {
    fs.writeFileSync(path.join(process.cwd(), "../data", "db.json"), JSON.stringify(data));
}

export function getAllTower() {
    return read().towers;
}

export function getFilteredTower(qn: string) {
    return getAllTower().filter((t: Tower) => t.name.toLowerCase().includes(qn.toLowerCase()));
}

export function getAllStory() {
    return read().stories;
}

export function getAllUser() {
    return read().users
}

export function getOneUser(un: string, p: string) {
    return getAllUser().filter((u: User) => u.username === un && u.password === p);
}