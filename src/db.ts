import pkg from "pg";
import "dotenv/config";

const { Client } = pkg;

export const c = new Client({
    connectionString: process.env.RENDER_DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

export async function connect() {
    try {
        await c.connect();
        console.log("Connected to database");
    } catch(e) {
        console.log((e as Error).message);
    }
}