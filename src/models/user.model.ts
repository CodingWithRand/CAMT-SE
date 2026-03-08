import { OrderItem } from "./order.model";
import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true},
    username: { type: String, required: true },
    email: { type: String, required: true},
    ph: { type: String, required: true },
    role: { type: String, required: true },
    cart: { type: Array }
    //avatar?: string;
  }
)

export type UserRole = "customer" | "admin";
export type UserDoc = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model("User", userSchema);
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  cart: OrderItem[];
  //avatar?: string;
}
