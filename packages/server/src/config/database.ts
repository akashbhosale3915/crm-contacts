import mongoose from "mongoose";

export const mongoUri =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crm";

export async function connectToDatabase(): Promise<typeof mongoose> {
  return mongoose.connect(mongoUri);
}
