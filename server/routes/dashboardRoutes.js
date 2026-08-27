// routes/dashboardRoutes.js
// All dashboard-related endpoints, mounted at /api/dashboard in server.js.
// These are all read-only (GET) - the dashboard never writes data directly,
// it's a summary view of data created elsewhere (Clients page, Jobs page,
// Candidates page, etc).
import express from "express";
import {
  getStats,
  getHiringOverview,
  getJobStatusDistribution,
  getRecruiterPerformance,
  getTodayInterviews,
  getRecentCandidates,
  getUpcomingFollowups,
  getRecentActivities,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getStats);
router.get("/hiring-overview", getHiringOverview);
router.get("/job-status", getJobStatusDistribution);
router.get("/recruiter-performance", getRecruiterPerformance);
router.get("/today-interviews", getTodayInterviews);
router.get("/recent-candidates", getRecentCandidates);
router.get("/upcoming-followups", getUpcomingFollowups);
router.get("/recent-activities", getRecentActivities);

export default router;
