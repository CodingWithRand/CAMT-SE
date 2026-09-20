import { Request, Response, Router } from 'express';
import supabase from '../db';

const router = Router();

async function getUserData(req: Request, res: Response, uid: string) {
    try {
        //SELECT * FROM user WHERE uid = uid;
        const { data, error } = await supabase
            // .from("user")
            .from("v_user_all_data") // more data -> user interests
            .select("*")
            .eq("uid", uid);
 
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

router.get('/user/current/fetch', async (req, res) => {
    getUserData(req, res, req.userId!);
})

router.get('/user/:uid/fetch', async (req, res) => {
    const { uid } = req.params;
    getUserData(req, res, uid);
})

//considering letting template user creation in prototype stage.

export default router;