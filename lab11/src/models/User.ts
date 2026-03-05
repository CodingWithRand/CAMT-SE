import mongoose, { InferSchemaType } from "mongoose";
const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);
export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = mongoose.model("User", userSchema);
