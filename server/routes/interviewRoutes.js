// routes/interviewRoutes.js
// All interview-related endpoints, mounted at /api/interviews in server.js.
import express from "express";
import {
  getInterviews,
  getInterviewStats,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
} from "../controllers/interviewController.js";

const router = express.Router();

router.get("/", getInterviews);
router.get("/stats", getInterviewStats); // must come before "/:id"
router.get("/:id", getInterviewById);
router.post("/", createInterview);
router.put("/:id", updateInterview);
router.delete("/:id", deleteInterview);

export default router;