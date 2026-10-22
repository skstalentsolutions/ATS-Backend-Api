// server/routes/candidateDatabaseRoutes.js
// Dedicated routes for Candidate Database management

import express from "express";
import multer from "multer";
import {
  getCandidates,
  getDatabaseStats,
  getCandidateById,
  createCandidate,
  bulkImportCandidates,
  updateCandidate,
  moveCandidate,
  deleteCandidate,
  deleteMultipleCandidates,
  uploadResume,
  parseResume,
} from "../controllers/candidateDatabaseController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Database stats
router.get("/stats", getDatabaseStats);

// Resume upload & parsing
router.post("/upload-resume", upload.single("resume"), uploadResume);
router.post("/parse-resume", upload.single("resume"), parseResume);

// Bulk operations
router.post("/bulk", bulkImportCandidates);
router.post("/bulk-delete", deleteMultipleCandidates);

// Move candidate
router.put("/:id/move", moveCandidate);

// Standard CRUD
router.get("/", getCandidates);
router.get("/:id", getCandidateById);
router.post("/", createCandidate);
router.put("/:id", updateCandidate);
router.delete("/:id", deleteCandidate);

export default router;
