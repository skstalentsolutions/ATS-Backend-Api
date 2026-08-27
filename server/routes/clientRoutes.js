// routes/clientRoutes.js
// All client-related endpoints, mounted at /api/clients in server.js.
import express from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  importClients,
} from "../controllers/clientController.js";

const router = express.Router();

router.get("/", getClients);
router.post("/import", importClients); // must come before "/:id" routes below
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;