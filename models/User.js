import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "recruiter", "interviewer", "candidate"],
      default: "recruiter",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    // Personal Information
    phone: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    // Company Information
    companyName: {
      type: String,
      default: "",
    },
    officeLocation: {
      type: String,
      default: "",
    },
    workMode: {
      type: String,
      default: "",
    },
    workingHours: {
      type: String,
      default: "",
    },
    // Extended Settings Fields
    companyEmail: {
      type: String,
      default: "",
    },
    companyPhone: {
      type: String,
      default: "",
    },
    companyAddress: {
      type: String,
      default: "",
    },
    companyTimezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    companyCurrency: {
      type: String,
      default: "INR (₹)",
    },
    companyLogo: {
      type: String,
      default: "",
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    sessionTimeout: {
      type: String,
      default: "30 Minutes",
    },
    passwordPolicy: {
      type: String,
      default: "Strong (8+ characters)",
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    whatsAppNotifications: {
      type: Boolean,
      default: true,
    },
    browserNotifications: {
      type: Boolean,
      default: true,
    },
    autoSave: {
      type: Boolean,
      default: false,
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
    compactView: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
