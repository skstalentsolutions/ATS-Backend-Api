// models/Recruiter.js
// A recruiter on the team. `joinees` is a running count of candidates they
// have gotten to "Joined" status this month. Powers "Recruiter Performance".
//
// NOTE: for simplicity, `joinees` is stored directly here instead of being
// calculated live from the Candidate collection. A more advanced version
// would use a MongoDB aggregation on Candidate (group by recruiter, count
// status:"Joined") instead of trusting this stored number - worth doing
// once you're comfortable with aggregation pipelines.
import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    joinees: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Recruiter", recruiterSchema);
