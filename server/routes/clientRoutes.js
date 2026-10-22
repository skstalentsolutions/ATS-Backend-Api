// routes/clientRoutes.js
// All client-related endpoints, mounted at /api/clients in server.js.
import express from "express";
import {
  getClients,
  getClientStats,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  restoreClient,
  hardDeleteClient,
  importClients,
} from "../controllers/clientController.js";

const router = express.Router();

// Metrics endpoint (placed before /:id)
router.get("/stats", getClientStats);
router.post("/import", importClients);

// Base CRUD routes
router.get("/", getClients);
router.post("/", createClient);
router.get("/:id", getClientById);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

// Restore & Hard Delete routes
router.post("/:id/restore", restoreClient);
router.delete("/:id/hard", hardDeleteClient);

export default router;