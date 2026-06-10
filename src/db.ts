import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "dotenv/config";

// https://medium.com/@heshramsis/building-a-crud-app-with-supabase-and-express-a-step-by-step-guide-for-junior-developers-81456b850910
export const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!
);

export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const auth: SupabaseClient["auth"] = supabase.auth;

// import pkg from "pg";

// const { Client } = pkg;

// export const c = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//         rejectUnauthorized: false
//     }
// })

// supabase password db ebcx osxm ynsn ihpr

// export async function connect() {
//     try {
//         await c.connect();
//         console.log("Connected to database");
//     } catch(e) {
//         console.log((e as Error).message);
//     }
// }