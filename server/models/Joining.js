// models/Joining.js
// A selected candidate being tracked through to their actual joining date.
import mongoose from "mongoose";

const joiningSchema = new mongoose.Schema(
  {
    candidateName: { type: String, required: true },
    candidatePhone: { type: String },
    position: { type: String },
    client: { type: String, required: true },
    offerAcceptedOn: { type: Date },
    doj: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Joined", "Yet to Join", "No Show", "Offer Drop"],
      default: "Yet to Join",
    },
    workLocation: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Joining", joiningSchema);