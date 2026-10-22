// models/Followup.js
// A follow-up task tied to a candidate OR a client. Powers the Dashboard's
// "Pending Follow-ups" stat + "Upcoming Follow-ups" table, AND the full
// Follow-up Tracker page (client/src/pages/FollowUps/FollowupTracker.jsx).
import mongoose from "mongoose";

const followupSchema = new mongoose.Schema(
  {
    followupFor: { type: String, required: true }, // candidate or client name
    followupForType: { type: String, enum: ["Candidate", "Client"], default: "Candidate" },
    company: { type: String }, // the associated company (client company either way)
    relatedTo: { type: String }, // job title/role this follow-up concerns
    subject: { type: String, required: true },
    note: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    assignedTo: { type: String },
    assignedToRole: { type: String },
    status: { type: String, enum: ["Pending", "Completed", "Overdue"], default: "Pending" },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  },
  { timestamps: true }
);

export default mongoose.model("Followup", followupSchema);