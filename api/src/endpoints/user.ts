import { Request, Response, Router } from 'express';
import supabase from '../db';
import { auth } from '../middleware';

const router = Router();

export async function getUserData(uid: string) {
    //SELECT * FROM user WHERE uid = uid;
    const { data, error } = await supabase
        // .from("user")
        .from("v_user_all_data") // more data -> user interests
        .select("*")
        .eq("id", uid)
        .single();

    if (error) throw error;
    return data
}

router.get('/user/current/fetch', auth, async (req, res) => {
    try {
        const data = await getUserData(req.userId!);
        res.status(200).json(data);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
})

router.get('/user/:uid/fetch', async (req, res) => {
    const { uid } = req.params;
    try {
        const data = await getUserData(uid);
        res.status(200).json(data);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
})

router.post('/user/:uid/user_interests', auth, async (req, res) => {
    const { uid } = req.params;
    const { cate_id } = req.body;
    try {
        const { data, error } = await supabase.rpc("user_interests_op", { uid, cate_id })
        if(error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
})

const EMAIL_DOMAIN = "@cmu.ac.th";

/**
 * Register a @cmu.ac.th account: creates the Supabase Auth user and its row in `users`.
 *
 * The domain is checked here, not only in the browser, since the browser check can be skipped.
 * The account is created already confirmed: no confirmation email is sent, because
 * Supabase's built-in mailer does not deliver to outside addresses without custom SMTP.
 */
router.post('/user/register', async (req: Request, res: Response) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const display_name = String(req.body?.display_name ?? "").trim();

    if (!/^[^\s@]+@cmu\.ac\.th$/.test(email)) {
        return res.status(400).json({ message: `Only ${EMAIL_DOMAIN} accounts can register` });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (display_name.length < 2 || display_name.length > 50) {
        return res.status(400).json({ message: "Display name must be 2-50 characters" });
    }

    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { display_name },
        });
        if (error) {
            if (error.code === "email_exists" || /already (been )?registered|already exists/i.test(error.message)) {
                return res.status(409).json({ message: "This email already has an account" });
            }
            throw error;
        }

        const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            cmu_account: email,
            email,
            display_name,
            is_mod: false, // never taken from the request
        });
        if (profileError) {
            // Don't leave an auth user without a profile behind.
            await supabase.auth.admin.deleteUser(data.user.id);
            throw profileError;
        }

        res.status(201).json({ id: data.user.id });
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

export default router;