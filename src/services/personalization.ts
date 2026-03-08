import { User, UserModel } from "../models/user.model";
// import { getData } from "./util";

export const getUser = async (uid: string) => await UserModel.findOne({ id: uid })
