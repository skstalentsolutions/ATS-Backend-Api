import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
    logoText: {
      type: String,
      default: "job",
    },
    logoBg: {
      type: String,
      default: "bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    },
    type: {
      type: String,
      required: true,
      default: "Full Time",
    },
    location: {
      type: String,
      required: true,
    },
    fullLocation: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    vacancies: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ["Active", "On Hold", "Closed"],
      default: "Active",
    },
    postedOn: {
      type: String,
      default: "Today",
    },
    closingDate: {
      type: String,
      default: "Not Specified",
    },
    ctcRange: {
      type: String,
      default: "Not Specified",
    },
    recruiter: {
      type: String,
      default: "Sanjay Kushwaha",
    },
    candidatesCount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    attachmentName: {
      type: String,
      default: "Attached_Document.pdf",
    },
    employmentType: {
      type: String,
      default: "Permanent",
    },
    department: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    workMode: {
      type: String,
      default: "On-site",
    },
    salaryType: {
      type: String,
      default: "Fixed",
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    responsibilities: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    preferredQualifications: {
      type: String,
      default: "",
    },
    languages: {
      type: String,
      default: "",
    },
    noticePeriod: {
      type: String,
      default: "",
    },
    interviewProcess: {
      type: String,
      default: "",
    },
    postedBy: {
      type: String,
      default: "Sanjay Kushwaha",
    },
    internalNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
