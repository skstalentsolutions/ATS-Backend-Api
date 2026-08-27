// models/Activity.js
// A single entry in the "Recent Activities" feed (e.g. "Rahul Kumar added
// as candidate"). `type` controls which colored dot is shown on the
// frontend (see RecentActivities.jsx / TableCards.css: dot-add, dot-offer, etc).
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ["add", "schedule", "offer", "job", "join", "reject"],
      default: "add",
    },
  },
  { timestamps: true } // createdAt is used as the activity's timestamp
);

export default mongoose.model("Activity", activitySchema);
