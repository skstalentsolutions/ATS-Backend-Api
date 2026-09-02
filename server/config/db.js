// config/db.js
// Connects to MongoDB using the URI in .env. Called once from server.js
// when the app starts.
import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop the server if the DB connection fails
  }
}
