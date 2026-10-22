import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    candidateEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    candidatePhone: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
    offerId: {
      type: String,
      required: true,
      unique: true,
    },
    sentOn: {
      type: String,
      default: "",
    },
    validTill: {
      type: String,
      default: "",
    },
    template: {
      type: String,
      default: "Standard Offer Template",
    },
    offerType: {
      type: String,
      default: "New",
    },
    ctc: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Accepted", "Pending", "Declined", "Withdrawn", "Draft"],
      default: "Pending",
    },
    responseOn: {
      type: String,
      default: "",
    },
    assignedTo: {
      name: { type: String, default: "Sanjay Kushwaha" },
      role: { type: String, default: "Super Admin" },
      avatar: { type: String, default: "SK" },
    },
    documents: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    history: [
      {
        event: { type: String },
        date: { type: String },
        user: { type: String },
      },
    ],
    // Detailed compensation and metadata fields
    department: {
      type: String,
      default: "",
    },
    reportingManager: {
      type: String,
      default: "",
    },
    offerDate: {
      type: String,
      default: "",
    },
    expectedJoiningDate: {
      type: String,
      default: "",
    },
    employmentType: {
      type: String,
      default: "Full Time",
    },
    currency: {
      type: String,
      default: "INR",
    },
    payStructure: {
      type: String,
      default: "Annually",
    },
    basicSalary: {
      type: Number,
      default: 0,
    },
    hra: {
      type: Number,
      default: 0,
    },
    specialAllowance: {
      type: Number,
      default: 0,
    },
    otherAllowance: {
      type: Number,
      default: 0,
    },
    performanceIncentive: {
      type: Number,
      default: 0,
    },
    joiningBonus: {
      type: Number,
      default: 0,
    },
    probationPeriod: {
      type: String,
      default: "",
    },
    noticePeriod: {
      type: String,
      default: "",
    },
    termsAndConditions: {
      type: String,
      default: "",
    },
    otherBenefits: {
      type: [String],
      default: [],
    },
    offerValidity: {
      type: String,
      default: "",
    },
    offerExpiryDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);
export default Offer;
