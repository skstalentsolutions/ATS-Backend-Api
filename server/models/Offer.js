// server/models/Offer.js
// Comprehensive Offer model combining Mansi's offer status tracking and Khushi's offer generation.

import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    offerId: { type: String, default: "" },
    candidateName: { type: String, required: true, trim: true },
    candidateEmail: { type: String, default: "", trim: true },
    candidatePhone: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    department: { type: String, default: "" },
    client: { type: String, default: "" },
    clientName: { type: String, default: "" },
    clientLocation: { type: String, default: "" },
    joiningDate: { type: String, default: "" },
    ctc: { type: String, default: "" },
    fixedCtc: { type: String, default: "" },
    variableCtc: { type: String, default: "" },
    joiningBonus: { type: String, default: "" },
    relocationAllowance: { type: String, default: "" },
    stockOptions: { type: String, default: "" },
    probationPeriod: { type: String, default: "" },
    noticePeriod: { type: String, default: "" },
    reportingManager: { type: String, default: "" },
    workLocation: { type: String, default: "" },
    designation: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Pending", "Accepted", "Declined", "Rejected", "Revoked", "Joined"],
      default: "Draft",
    },
    createdDate: { type: String, default: "" },
    expiryDate: { type: String, default: "" },
    documentUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    termsAndConditions: { type: String, default: "" },
  },
  { timestamps: true }
);

offerSchema.pre("save", function (next) {
  if (!this.client && this.clientName) {
    this.client = this.clientName;
  } else if (!this.clientName && this.client) {
    this.clientName = this.client;
  }
  next();
});

const Offer = mongoose.model("Offer", offerSchema);
export default Offer;
