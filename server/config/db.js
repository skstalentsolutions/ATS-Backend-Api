// config/db.js
// Connects to MongoDB using the URI in .env. Called once from server.js
// when the app starts.
import mongoose from "mongoose";

export default async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      console.error(
        "FATAL CONFIG ERROR: MONGO_URI is not set in environment variables! Please configure MONGO_URI in your deployment dashboard."
      );
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop the server if the DB connection fails
  }
}
