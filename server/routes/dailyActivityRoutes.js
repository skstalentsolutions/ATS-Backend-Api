// routes/dailyActivityRoutes.js
import express from "express";
import {
  getDailyActivities,
  getDailyActivityStats,
  getActivityOverview,
  getActivityTrend,
  getPrioritySummary,
  getTodaySchedule,
  getDailyActivityById,
  createDailyActivity,
  updateDailyActivity,
  deleteDailyActivity,
} from "../controllers/dailyActivityController.js";

const router = express.Router();

router.get("/", getDailyActivities);
router.get("/stats", getDailyActivityStats);
router.get("/overview", getActivityOverview);
router.get("/trend", getActivityTrend);
router.get("/priority-summary", getPrioritySummary);
router.get("/today-schedule", getTodaySchedule);
router.get("/:id", getDailyActivityById);
router.post("/", createDailyActivity);
router.put("/:id", updateDailyActivity);
router.delete("/:id", deleteDailyActivity);

export default router;