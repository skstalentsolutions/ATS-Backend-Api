// // models/Invoice.js
// // Invoice document schema for SKS Talent Solutions.
// // Tracks client billing, services provided, due dates, payments, and overdue aging.
// import mongoose from "mongoose";

// const invoiceItemSchema = new mongoose.Schema(
//   {
//     description: { type: String, required: true },
//     quantity: { type: Number, default: 1 },
//     rate: { type: Number, required: true },
//     amount: { type: Number, required: true },
//   },
//   { _id: false }
// );

// const invoiceSchema = new mongoose.Schema(
//   {
//     invoiceNo: { type: String, required: true, unique: true }, // e.g. "INV-2024-064"
//     client: { type: String, required: true }, // e.g. "TCS Technologies"
//     clientLogo: { type: String, default: "" }, // short badge or acronym e.g. "TCS"
//     jobService: { type: String, required: true }, // e.g. "Software Developer", "HR Executive"
//     invoiceType: {
//       type: String,
//       enum: ["Placement Fees", "Consulting Fees", "Training Fees", "Other Income"],
//       default: "Placement Fees",
//     },
//     invoiceDate: { type: Date, required: true },
//     dueDate: { type: Date, required: true },
//     amount: { type: Number, required: true },
//     tax: { type: Number, default: 0 },
//     totalAmount: { type: Number, default: 0 },
//     status: {
//       type: String,
//       enum: ["Paid", "Pending", "Overdue", "Draft", "Cancelled"],
//       default: "Pending",
//     },
//     paymentDate: { type: Date },
//     paymentMode: {
//       type: String,
//       enum: ["Bank Transfer", "UPI", "Cheque", "Cash", "Other"],
//       default: "Bank Transfer",
//     },
//     paymentReference: { type: String, default: "" },
//     poContractNo: { type: String, default: "" },
//     billingCurrency: {
//       type: String,
//       enum: ["INR", "USD", "EUR", "GBP"],
//       default: "INR",
//     },
//     notes: { type: String, default: "" },
//     items: { type: [invoiceItemSchema], default: [] },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Invoice", invoiceSchema);
// models/Invoice.js

import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },

    client: {
      type: String,
      required: true,
    },

    // NEW
    company: {
      type: String,
      default: "",
    },

    clientLogo: {
      type: String,
      default: "",
    },

    jobService: {
      type: String,
      required: true,
    },

    invoiceType: {
      type: String,
      enum: [
        "Placement Fees",
        "Consulting Fees",
        "Training Fees",
        "Other Income",
      ],
      default: "Placement Fees",
    },

    invoiceDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    tax: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue", "Draft", "Cancelled"],
      default: "Pending",
    },

    paymentDate: {
      type: Date,
    },

    paymentMode: {
      type: String,
      enum: [
        "Bank Transfer",
        "UPI",
        "Cheque",
        "Cash",
        "Other",
      ],
      default: "Bank Transfer",
    },

    paymentReference: {
      type: String,
      default: "",
    },

    poContractNo: {
      type: String,
      default: "",
    },

    billingCurrency: {
      type: String,
      enum: ["INR", "USD", "EUR", "GBP"],
      default: "INR",
    },

    notes: {
      type: String,
      default: "",
    },

    items: {
      type: [invoiceItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Invoice", invoiceSchema);