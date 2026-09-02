// routes/followupRoutes.js
// All follow-up-related endpoints, mounted at /api/followups in server.js.
import express from "express";
import {
  getFollowups,
  getFollowupStats,
  getFollowupInsights,
  getFollowupById,
  createFollowup,
  updateFollowup,
  deleteFollowup,
  bulkDeleteFollowups,
} from "../controllers/followupController.js";

const router = express.Router();

router.get("/", getFollowups);
router.get("/stats", getFollowupStats); // must come before "/:id"
router.get("/insights", getFollowupInsights); // must come before "/:id"
router.post("/bulk-delete", bulkDeleteFollowups); // must come before "/:id"
router.get("/:id", getFollowupById);
router.post("/", createFollowup);
router.put("/:id", updateFollowup);
router.delete("/:id", deleteFollowup);

export default router;