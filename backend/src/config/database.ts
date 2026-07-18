import mongoose from "mongoose";
import  env from "./env";
export const connectDatabase =
  async (): Promise<void> => {
    try {
      const mongoURI =
        env.mongodb.uri;

      if (!mongoURI) {
        throw new Error(
          "MONGODB_URI is not configured"
        );
      }

      await mongoose.connect(
        mongoURI
      );

      console.log(
        "🍃 MongoDB connected successfully"
      );
    } catch (error) {
      console.error(
        "❌ MongoDB connection failed:",
        error
      );

      process.exit(1);
    }
  };