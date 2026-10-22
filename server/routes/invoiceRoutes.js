// routes/invoiceRoutes.js
// Express API routing for the Invoice Module.
import express from "express";
import {
  getInvoices,
  getInvoiceStats,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  importInvoices,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/", getInvoices);
router.get("/stats", getInvoiceStats);
router.get("/:id", getInvoiceById);
router.post("/", createInvoice);
router.post("/import", importInvoices);
router.put("/:id", updateInvoice);
router.patch("/:id/payment", recordPayment);
router.delete("/:id", deleteInvoice);

export default router;
