// models/Offer.js
// An offer letter released (or pending release) to a candidate. Powers
// "Offers Released" stat card and (via `amount`) the "Revenue" stat card.
import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    candidateName: { type: String, required: true },
    client: { type: String },
    position: { type: String },
    status: { type: String, enum: ["Released", "Pending"], default: "Pending" },
    amount: { type: Number, default: 0 }, // recruitment fee/revenue tied to this offer
    releasedDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
