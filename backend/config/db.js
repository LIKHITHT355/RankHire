import mongoose from "mongoose";

// This opens one connection to MongoDB when the server starts.
// The connection string comes from the private .env file, not code.
// A failed connection stops startup so requests never use missing data.
export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}
