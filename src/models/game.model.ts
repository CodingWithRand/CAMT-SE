import mongoose, { InferSchemaType } from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    slug: { type: String },
    title: { type: String, required: true },
    developer: { type: String },
    publisher: { type: String },

    platforms: { type: Array, required: true }, // Reusable
    genres: { type: Array, required: true },
    tags: { type: Array, required: true },

    releaseDate: { type: String },
    isPreOrder: { type: Boolean },
    availability: { type: String, required: true }, // Reusable

    price: { type: Number },
    currency: { type: String, required: true },

    thumbnailUrl: { type: String },
    screenshots: { type: Array },
    description: { type: String },

    stock: { type: Number }, // Added for the Cart MVP logic
  }
)


export type Platform = "PC" | "PS5" | "Xbox" | "Switch" | "Mobile";
export type Availability =
  | "available"
  | "coming_soon"
  | "early_access"
  | "delisted";

export interface Game {
  id: string;
  slug: string;
  title: string;
  developer: string;
  publisher: string;
  
  platforms: Platform[]; // Reusable
  genres: string[];
  tags: string[];
  
  releaseDate: string;
  isPreOrder?: boolean;
  availability: Availability; // Reusable
  
  price: number;
  currency: String;
  
  thumbnailUrl: string;
  screenshots?: string[];
  description: string;

  stock: number; // Added for the Cart MVP logic
}

export type GameDoc = InferSchemaType<typeof gameSchema>;
export const GameModel = mongoose.model("Game", gameSchema);
