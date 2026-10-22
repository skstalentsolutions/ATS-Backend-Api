// server/models/CandidateDatabase.js
// Dedicated Mongoose Model for Candidate Database Management page
// Stores candidate profiles, skills, education, employment history, and statuses.

import mongoose from "mongoose";

const candidateDatabaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      default: "Candidate",
      trim: true,
    },
    position: {
      type: String,
      default: "",
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: "0 Years",
    },
    location: {
      type: String,
      default: "Indore (M.P.)",
    },
    status: {
      type: String,
      default: "Shortlisted",
      trim: true,
    },
    stage: {
      type: String,
      default: "shortlisted",
      trim: true,
      lowercase: true,
    },
    client: {
      type: String,
      default: "TCS (Tata Consultancy Services)",
    },
    company: {
      type: String,
      default: "Tata Consultancy Services (TCS)",
    },
    education: {
      type: String,
      default: "",
    },
    currentCompany: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    dateAdded: {
      type: String,
      default: () => {
        const now = new Date();
        const options = { day: "2-digit", month: "short", year: "numeric" };
        return now.toLocaleDateString("en-GB", options);
      },
    },
    resumeName: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    currentCTC: {
      type: String,
      default: "",
    },
    expectedCTC: {
      type: String,
      default: "",
    },
    noticePeriod: {
      type: String,
      default: "30 Days",
    },
    source: {
      type: String,
      default: "Direct",
    },
    recruiter: {
      type: String,
      default: "Sanjay Kushwaha",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

// Auto sync stage and status if one is updated
candidateDatabaseSchema.pre("save", function (next) {
  if (this.role && !this.position) {
    this.position = this.role;
  } else if (this.position && !this.role) {
    this.role = this.position;
  }
  if (this.company && !this.client) {
    this.client = this.company;
  } else if (this.client && !this.company) {
    this.company = this.client;
  }
  next();
});

const CandidateDatabase = mongoose.model(
  "CandidateDatabase",
  candidateDatabaseSchema,
  "candidate_database"
);

export default CandidateDatabase;
