// server.js
// Entry point for the backend. Run with `npm run dev` (inside server/).
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import clientRoutes from "./routes/clientRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import followupRoutes from "./routes/followupRoutes.js";
import joiningRoutes from "./routes/joiningRoutes.js";
import dailyActivityRoutes from "./routes/dailyActivityRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";

// The other intern will add their own line here for Jobs, e.g.:
// import jobRoutes from "./routes/jobRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors()); // allows the React app (running on a different port) to call this API
app.use(express.json()); // parses JSON request bodies

app.use("/api/clients", clientRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/joinings", joiningRoutes);
app.use("/api/daily-activities", dailyActivityRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/invoices", invoiceRoutes);

app.get("/", (req, res) => res.send("SKS Talent Solutions API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
