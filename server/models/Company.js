// models/Company.js
// Dedicated Company Management model for organizations, corporate clients & hiring companies.
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    contact: { type: String, trim: true, default: "" },
    clientName: { type: String, trim: true, default: "" },
    designation: { type: String, trim: true, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    industry: { type: String, default: "IT Services" },
    companySize: { type: String, default: "" },
    gst: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    activeJobs: { type: Number, default: 0 },
    logo: { type: String, default: "" },
    notes: { type: String, default: "" },

    // Agreement & Legal Details
    agreementFile: { type: String, default: "" },
    agreementStart: { type: Date },
    agreementEnd: { type: Date },
    agreementStatus: {
      type: String,
      enum: ["Active", "Expired", "Pending"],
      default: "Pending",
    },

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Keep companyName and company synchronized
companySchema.pre("validate", function (next) {
  if (this.companyName && !this.company) {
    this.company = this.companyName;
  } else if (this.company && !this.companyName) {
    this.companyName = this.company;
  }

  if (this.contact && !this.clientName) {
    this.clientName = this.contact;
  } else if (this.clientName && !this.contact) {
    this.contact = this.clientName;
  }

  next();
});

const Company = mongoose.models.Company || mongoose.model("Company", companySchema);
export default Company;
