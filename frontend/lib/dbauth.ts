import { createClient } from '@supabase/supabase-js';

// Browser Supabase client: used for login (AuthContext) and the live-update channel only.
// All data goes through the API.
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function mockSignIn() {
    await supabase.auth.signInWithPassword({
        email: "nat_w@cmu.ac.th",
        password: "testnat"
    })
}

export async function mockModSignIn() {
    await supabase.auth.signInWithPassword({
        email: "admin_mod@cmu.ac.th",
        password: "testadmin"
    })
}
