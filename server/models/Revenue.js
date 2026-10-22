// models/Revenue.js
// A single revenue entry (an invoice/deal) tied to a client. Powers the
// Revenue Tracker page and the Add Revenue form.
import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    size: { type: Number, default: 0 },
    type: { type: String, default: "" },
  },
  { _id: false }
);

const revenueSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true },
    client: { type: String, required: true },
    company: { type: String, default: "" },
    jobService: { type: String },
    revenueType: {
      type: String,
      enum: ["Placement Fees", "Consulting Fees", "Training Fees", "Other Income"],
      default: "Placement Fees",
    },
    invoiceDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue", "Draft"],
      default: "Pending",
    },
    paymentDate: { type: Date },
    remarks: { type: String, default: "" },

    poContractNo: { type: String, default: "" },
    billingCurrency: {
      type: String,
      enum: ["INR", "USD", "EUR", "GBP"],
      default: "INR",
    },
    exchangeRate: { type: Number, default: 1 },
    paymentMode: {
      type: String,
      enum: ["Bank Transfer", "UPI", "Cheque", "Cash", "Other"],
      default: "Bank Transfer",
    },
    paymentReference: { type: String, default: "" },

    candidateName: { type: String, default: "" },
    candidateStatus: { type: String, default: "" },
    doj: { type: Date },
    offeredCtc: { type: Number, default: 0 },
    source: { type: String, default: "" },

    hasAssociate: { type: Boolean, default: false },
    associateName: { type: String, default: "" },
    commissionType: {
      type: String,
      enum: ["Percentage", "Fixed"],
      default: "Percentage",
    },
    commissionPercent: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },

    attachments: { type: [attachmentSchema], default: [] },
    isDraft: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Revenue", revenueSchema);
