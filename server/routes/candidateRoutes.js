// server/routes/candidateRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadResume,
  parseResume,
  getCandidateStats,
  getCandidates,
  getCandidateById,
  createCandidate,
  bulkImportCandidates,
  updateCandidate,
  updateCandidateStage,
  deleteCandidate,
} from "../controllers/candidateController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/upload-resume", upload.single("resume"), uploadResume);
router.post("/parse-resume", upload.single("resume"), parseResume);
router.get("/stats", getCandidateStats);
router.get("/", getCandidates);
router.get("/:id", getCandidateById);
router.post("/", createCandidate);
router.post("/bulk", bulkImportCandidates);
router.put("/:id", updateCandidate);
router.patch("/:id/stage", updateCandidateStage);
router.delete("/:id", deleteCandidate);

export default router;
