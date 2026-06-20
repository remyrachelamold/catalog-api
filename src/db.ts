import mongoose from "mongoose";
import logger from "./logger";

export async function connectDatabase(uri?: string): Promise<void> {
  const mongoUri = uri ?? process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
  }

  await mongoose.connect(mongoUri);
  logger.info("Connected to MongoDB");
}
