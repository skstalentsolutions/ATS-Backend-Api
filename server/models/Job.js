// models/Job.js
// A job opening posted for a client. Status drives both the "Active Jobs"
// stat card and the "Job Status Distribution" donut chart on the dashboard.
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    client: { type: String, required: true }, // client company name
    status: {
      type: String,
      enum: ["Open", "Closed", "On Hold", "Cancelled"],
      default: "Open",
    },
    closingSoon: { type: Boolean, default: false }, // powers "5 Closing Soon" text
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
