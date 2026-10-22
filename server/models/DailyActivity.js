// models/DailyActivity.js
// A single logged activity (call, follow-up, interview scheduling,
// networking, etc) for the Daily Activity page. Kept separate from the
// simpler models/Activity.js (which only powers the Dashboard's small
// "Recent Activities" feed) since this page needs a much richer shape -
// type, owner, priority, status, scheduled time - without risking
// breaking that simpler feed.
import mongoose from "mongoose";

const dailyActivitySchema = new mongoose.Schema(
  {
    activityName: { type: String, required: true }, // e.g. "Client Call", "Follow-up"
    type: {
      type: String,
      enum: ["Client Call", "Candidate Follow-up", "Interview", "Networking", "Other Activity"],
      required: true,
    },
    relatedTo: { type: String },
    details: { type: String },
    ownerName: { type: String },
    ownerRole: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    priority: { type: String, enum: ["High", "Medium", "Low", "No Priority"], default: "Medium" },
    status: { type: String, enum: ["Completed", "In Progress", "Pending"], default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("DailyActivity", dailyActivitySchema);