// models/Interview.js
// A scheduled interview. Powers the Dashboard's "Interviews Today" stat +
// "Today's Interviews" table, AND the full Interview Management page
// (client/src/pages/Interviews/InterviewManagement.jsx).
import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    candidateName: { type: String, required: true },
    candidatePhone: { type: String },
    company: { type: String, required: true }, // the hiring company - always required
    client: { type: String }, // optional - can differ from company (e.g. a referring vendor); left blank is fine
    position: { type: String }, // shown as "Job Title" in the UI
    round: { type: String, default: "Round 1 - HR Interview" },
    interviewerName: { type: String },
    interviewerRole: { type: String },
    mode: { type: String, enum: ["Online", "Offline"], default: "Online" },
    meetingLink: { type: String }, // only relevant when mode is "Online"
    date: { type: Date, required: true }, // the calendar day of the interview
    time: { type: String, required: true }, // display string, e.g. "10:00 AM"
    duration: { type: Number, default: 30 }, // minutes
    agenda: { type: [String], default: [] }, // checklist shown in the details panel
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Cancelled", "Pending Feedback"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);