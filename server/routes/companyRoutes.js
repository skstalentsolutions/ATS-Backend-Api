// routes/companyRoutes.js
// Dedicated routes for Company Management API endpoints.
import express from "express";
import {
  getCompanies,
  getCompanyStats,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  restoreCompany,
  hardDeleteCompany,
  importCompanies,
} from "../controllers/companyController.js";

const router = express.Router();

// Stats metric route (must be before :id to prevent matching as id)
router.get("/stats", getCompanyStats);
router.post("/import", importCompanies);

// Base CRUD routes
router.get("/", getCompanies);
router.post("/", createCompany);
router.get("/:id", getCompanyById);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

// Restore & Hard Delete routes
router.post("/:id/restore", restoreCompany);
router.delete("/:id/hard", hardDeleteCompany);

export default router;
