// server/routes/jobRoutes.js
import express from "express";
import {
  getJobs,
  createJob,
  bulkImportJobs,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", getJobs);
router.post("/", createJob);
router.post("/bulk", bulkImportJobs);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
