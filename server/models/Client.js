// models/Client.js
// Client Management model supporting both direct Client fields (clientName, companyName)
// and legacy fields (contact, company) seamlessly.
import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientName: { type: String, trim: true },
    companyName: { type: String, trim: true },
    company: { type: String, trim: true },
    contact: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    isDeleted: { type: Boolean, default: false },

    // Additional client / company profile details
    designation: { type: String, trim: true, default: "" },
    industry: { type: String, default: "IT Services" },
    logo: { type: String, default: "" }, // short badge or initials
    activeJobs: { type: Number, default: 0 },
    companySize: { type: String, default: "" },
    website: { type: String, trim: true, default: "" },
    gst: { type: String, trim: true, default: "" },
    notes: { type: String, default: "" },

    // Agreement info
    agreementFile: { type: String, default: "" },
    agreementStart: { type: Date },
    agreementEnd: { type: Date },
    agreementStatus: { type: String, enum: ["Active", "Expired", "Pending"], default: "Pending" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Keep clientName <-> contact and companyName <-> company synchronized
clientSchema.pre("validate", function (next) {
  if (this.clientName && !this.contact) {
    this.contact = this.clientName;
  } else if (this.contact && !this.clientName) {
    this.clientName = this.contact;
  }

  if (this.companyName && !this.company) {
    this.company = this.companyName;
  } else if (this.company && !this.companyName) {
    this.companyName = this.company;
  }

  // Fallbacks if one wasn't supplied
  if (!this.contact && !this.clientName) {
    this.contact = "Unnamed Client";
    this.clientName = "Unnamed Client";
  }
  if (!this.company && !this.companyName) {
    this.company = "Individual";
    this.companyName = "Individual";
  }

  next();
});

// Index for high performance search
clientSchema.index({ clientName: "text", companyName: "text", email: "text", phone: "text" });

export default mongoose.model("Client", clientSchema);
