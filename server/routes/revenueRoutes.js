// routes/revenueRoutes.js
import express from "express";
import {
  getRevenues,
  getRevenueStats,
  getRevenueOverview,
  getRevenueByType,
  getPaymentStatus,
  getTopClients,
  getRevenueSummary,
  getRevenueFormOptions,
  getRevenueById,
  createRevenue,
  updateRevenue,
  deleteRevenue,
} from "../controllers/revenueController.js";

const router = express.Router();

router.get("/", getRevenues);
router.get("/stats", getRevenueStats);
router.get("/overview", getRevenueOverview);
router.get("/by-type", getRevenueByType);
router.get("/payment-status", getPaymentStatus);
router.get("/top-clients", getTopClients);
router.get("/summary", getRevenueSummary);
router.get("/form-options", getRevenueFormOptions);
router.get("/:id", getRevenueById);
router.post("/", createRevenue);
router.put("/:id", updateRevenue);
router.delete("/:id", deleteRevenue);

export default router;