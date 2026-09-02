// routes/joiningRoutes.js
import express from "express";
import {
  getJoinings,
  getJoiningStats,
  getRecentJoinings,
  getJoiningById,
  createJoining,
  updateJoining,
  deleteJoining,
} from "../controllers/joiningController.js";

const router = express.Router();

router.get("/", getJoinings);
router.get("/stats", getJoiningStats);
router.get("/recent", getRecentJoinings);
router.get("/:id", getJoiningById);
router.post("/", createJoining);
router.put("/:id", updateJoining);
router.delete("/:id", deleteJoining);

export default router;