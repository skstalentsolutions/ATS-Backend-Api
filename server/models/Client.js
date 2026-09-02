// models/Client.js
// A client company (e.g. TCS, Infosys) that SKS Talent Solutions recruits
// for. Field names match what the frontend's ClientTable.jsx and
// ClientDetailsPanel.jsx already expect.
import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    logo: { type: String, default: "" }, // short badge text, e.g. "TCS"
    contact: { type: String, required: true },
    designation: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    industry: { type: String },
    activeJobs: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // extra fields shown in the details panel
    companySize: { type: String },
    website: { type: String },
    gst: { type: String },
    address: { type: String },
    notes: { type: String },

    // agreement info shown in the details panel's "Agreement" section
    agreementFile: { type: String },
    agreementStart: { type: Date },
    agreementEnd: { type: Date },
    agreementStatus: { type: String, enum: ["Active", "Expired", "Pending"], default: "Pending" },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

export default mongoose.model("Client", clientSchema);
