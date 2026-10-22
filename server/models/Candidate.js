// server/models/Candidate.js
// Comprehensive Candidate model merging Mansi's dashboard analytics fields
// with Khushi's full ATS candidate database & resume parsing schema.

import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    initials: { type: String, default: "" },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "" },
    position: { type: String, default: "" },
    role: { type: String, default: "" },
    client: { type: String, default: "" },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    experience: { type: String, default: "" },
    education: { type: String, default: "" },
    currentCTC: { type: String, default: "" },
    expectedCTC: { type: String, default: "" },
    noticePeriod: { type: String, default: "30 Days" },
    source: {
      type: String,
      enum: ["Naukri.com", "LinkedIn", "Referral", "Internshala", "Direct", "Campus"],
      default: "Direct",
    },
    status: {
      type: String,
      enum: ["Screening", "Interview", "Selected", "Offer", "Joined", "Rejected", "applied", "screening", "shortlisted", "interview", "offer", "hired"],
      default: "Screening",
    },
    stage: {
      type: String,
      enum: ["applied", "screening", "shortlisted", "interview", "offer", "hired"],
      default: "applied",
    },
    rating: { type: Number, min: 0, max: 5, default: null },
    skills: { type: [String], default: [] },
    recruiter: { type: String, default: "Sanjay Kushwaha" },
    employeeId: { type: String, default: "" },
    appliedDate: { type: String, default: "Today" },
    joinedDate: { type: Date },
    gradientFrom: { type: String, default: "blue-500" },
    gradientTo: { type: String, default: "blue-600" },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
    notes: { type: String, default: "" },
    alternatePhone: { type: String, default: "" },
    preferredLocation: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    maritalStatus: { type: String, default: "" },
    nationality: { type: String, default: "" },
    aadharNumber: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    relevantExperience: { type: String, default: "" },
    industry: { type: String, default: "" },
    highestQualification: { type: String, default: "" },
    primarySkills: { type: [String], default: [] },
    secondarySkills: { type: [String], default: [] },
    toolsAndTechnologies: { type: [String], default: [] },
    otherSkills: { type: String, default: "" },
    experienceDetails: { type: Array, default: [] },
    resumeName: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    linkedinProfile: { type: String, default: "" },
    referenceName: { type: String, default: "" },
    referenceContact: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-generate initials from name if not provided
candidateSchema.pre("save", function (next) {
  if (!this.initials && this.name) {
    this.initials = this.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }
  if (!this.role && this.position) {
    this.role = this.position;
  } else if (!this.position && this.role) {
    this.position = this.role;
  }
  if (!this.company && this.client) {
    this.company = this.client;
  } else if (!this.client && this.company) {
    this.client = this.company;
  }
  next();
});

const Candidate = mongoose.model("Candidate", candidateSchema);
export default Candidate;
