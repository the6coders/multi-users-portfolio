import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  await mongoose.connect(env.MONGO_URI); // env.MONGO_URI maps to MONGODB_URI from .env
  console.log("MongoDB connected");
}
