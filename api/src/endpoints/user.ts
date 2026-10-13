import { Request, Response, Router } from 'express';
import supabase from '../db';
import { auth, uuidParam } from '../middleware';

const router = Router();
router.param("uid", uuidParam);

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

router.get('/user/:uid/fetch', auth, async (req, res) => {
    const uid = String(req.params.uid);
    try {
        const data = await getUserData(uid);
        // Email and account are private: only the user themselves or a moderator sees them.
        const self = uid === req.userId;
        const mod = !self && !!(await getUserData(req.userId!)).is_mod;
        if (self || mod) return res.status(200).json(data);
        res.status(200).json({ id: data.id, display_name: data.display_name, is_mod: data.is_mod, is_cmu_p: data.is_cmu_p });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
})

/** The signed-in user's interests (categories they get announcement notifications for). */
router.get('/user/interests', auth, async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from("user_interests")
            .select("category_id, category:categories(category_name)")
            .eq("user_id", req.userId!);
        if (error) throw error;
        res.status(200).json((data ?? []).map((r: any) => ({ category_id: r.category_id, category_name: r.category?.category_name })));
    } catch (error: any) {
        res.status(500).json({ code: error?.code, message: error?.message });
    }
})

router.put('/user/interests', auth, async (req, res) => {
    const { cate_id } = req.body;
    try {
        const { data, error } = await supabase.rpc("user_interests_op", { uid: req.userId!, cate_id })
        if(error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
})

/** Replace the signed-in user's interests with `category_ids`. Only ever their own. */
// router.put('/user/interests', auth, async (req: Request, res: Response) => {
//     const ids = req.body?.category_ids;
//     if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string")) {
//         return res.status(400).json({ message: "category_ids must be an array of category ids" });
//     }
//     const wanted = [...new Set(ids as string[])];
//     try {
//         const { data: current, error } = await supabase.from("user_interests").select("category_id").eq("user_id", req.userId!);
//         if (error) throw error;
//         const have = new Set((current ?? []).map((r) => r.category_id));
//         const remove = [...have].filter((id) => !wanted.includes(id));
//         const add = wanted.filter((id) => !have.has(id));
//         if (remove.length) {
//             const r = await supabase.from("user_interests").delete().eq("user_id", req.userId!).in("category_id", remove);
//             if (r.error) throw r.error;
//         }
//         if (add.length) {
//             const r = await supabase.from("user_interests").insert(add.map((category_id) => ({ user_id: req.userId!, category_id })));
//             if (r.error) throw r.error;
//         }
//         res.status(200).json({ category_ids: wanted });
//     } catch (error: any) {
//         res.status(500).json({ code: error?.code, message: error?.message });
//     }
// })

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