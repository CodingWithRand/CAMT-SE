import mongoose, { InferSchemaType } from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod:{ type: String },
    status: { type: String, required: true },
    dateCreated: { type: String, required: true }, //string for now
  }
)

export type OrderStatus = "pending" | "paid" | "cancelled";
export interface OrderItem {
  gameId: string;
  title: string;
  thumbnailUrl: string;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod:string;
  status: OrderStatus;
  dateCreated: string; //string for now
}

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const OrderModel = mongoose.model("Order", orderSchema);