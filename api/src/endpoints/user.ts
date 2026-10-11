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

//considering letting template user creation in prototype stage.

export default router;