import supabase from "./db";

/** A user's row from v_user_all_data (profile plus interests). Throws if there is none. */
export async function getUserData(uid: string) {
    const { data, error } = await supabase
        .from("v_user_all_data")
        .select("*")
        .eq("id", uid)
        .single();
    if (error) throw error;
    return data;
}
