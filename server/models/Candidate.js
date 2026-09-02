// models/Candidate.js
// A candidate moving through the recruitment pipeline. `status` tracks
// where they are (Screening -> Interview -> Selected -> Offer -> Joined,
// or Rejected at any point). Used for "Total Candidates", "Joined
// Candidates", "Recent Candidates" table, and the hiring overview chart
// (candidates with status "Joined" grouped by joinedDate month).
import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String },
    client: { type: String },
    recruiter: { type: String }, // which recruiter is handling this candidate
    status: {
      type: String,
      enum: ["Screening", "Interview", "Selected", "Offer", "Joined", "Rejected"],
      default: "Screening",
    },
    joinedDate: { type: Date }, // only set once status becomes "Joined"
  },
  { timestamps: true } // createdAt doubles as "date applied" for Recent Candidates
);

export default mongoose.model("Candidate", candidateSchema);
