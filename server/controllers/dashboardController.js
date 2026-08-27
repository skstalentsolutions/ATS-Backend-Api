// controllers/dashboardController.js
// Every function here powers one section of the Dashboard page. Grouped in
// one file since they're all read-only "give me a summary" endpoints,
// unlike clientController.js which does full CRUD.
import Client from "../models/Client.js";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Interview from "../models/Interview.js";
import Offer from "../models/Offer.js";
import Followup from "../models/Followup.js";
import Recruiter from "../models/Recruiter.js";
import Activity from "../models/Activity.js";

// Small helper: start/end of "today" as Date objects, used to filter
// interviews scheduled for today.
function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Small helper: start/end of the current calendar month, used for
// "Joined Candidates This Month" and "Revenue This Month".
function thisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// GET /api/dashboard/stats
// Returns the raw numbers for all 8 stat cards. The frontend attaches
// icon/color/trend-text styling to these numbers (see Dashboard.jsx).
export const getStats = async (req, res) => {
  try {
    const { start: todayStart, end: todayEnd } = todayRange();
    const { start: monthStart, end: monthEnd } = thisMonthRange();

    const [
      totalClients,
      activeJobs,
      totalCandidates,
      interviewsToday,
      offersReleased,
      pendingOffers,
      joinedThisMonth,
      pendingFollowups,
      revenueAgg,
    ] = await Promise.all([
      Client.countDocuments(),
      Job.countDocuments({ status: "Open" }),
      Candidate.countDocuments(),
      Interview.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
      Offer.countDocuments({ status: "Released" }),
      Offer.countDocuments({ status: "Pending" }),
      Candidate.countDocuments({
        status: "Joined",
        joinedDate: { $gte: monthStart, $lte: monthEnd },
      }),
      Followup.countDocuments({ status: { $ne: "Completed" } }),
      Offer.aggregate([
        { $match: { status: "Released", releasedDate: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      totalClients,
      activeJobs,
      totalCandidates,
      interviewsToday,
      offersReleased,
      pendingOffers,
      joinedThisMonth,
      pendingFollowups,
      revenueThisMonth: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/dashboard/hiring-overview
// Groups candidates with status "Joined" by the month they joined, for the
// current year - feeds the "Monthly Hiring Overview" line chart.
export const getHiringOverview = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const results = await Candidate.aggregate([
      {
        $match: {
          status: "Joined",
          joinedDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
        },
      },
      { $group: { _id: { $month: "$joinedDate" }, value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Fill in every month (even ones with 0 joins) so the chart always has
    // a full Jan-Dec (or however many months) x-axis instead of gaps.
    const data = monthNames.map((month, i) => {
      const match = results.find((r) => r._id === i + 1);
      return { month, value: match ? match.value : 0 };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/dashboard/job-status
// Groups jobs by status and converts to percentages - feeds the donut chart.
export const getJobStatusDistribution = async (req, res) => {
  try {
    const total = await Job.countDocuments();
    const grouped = await Job.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    const colors = { Open: "#2563eb", Closed: "#22b573", "On Hold": "#f5a623", Cancelled: "#ef4444" };
    const data = ["Open", "Closed", "On Hold", "Cancelled"].map((status) => {
      const match = grouped.find((g) => g._id === status);
      const count = match ? match.count : 0;
      return {
        name: status,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        color: colors[status],
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/dashboard/recruiter-performance
// Top recruiters by joinee count, with `percent` relative to the top scorer
// (used to size each progress bar).
export const getRecruiterPerformance = async (req, res) => {
  try {
    const recruiters = await Recruiter.find().sort({ joinees: -1 }).limit(4);
    const max = recruiters[0]?.joinees || 1;
    const colors = ["#2563eb", "#f5a623", "#22b573", "#8b5cf6"];

    const data = recruiters.map((r, i) => ({
      id: r._id,
      name: r.name,
      avatar: r.avatar,
      joinees: r.joinees,
      percent: Math.round((r.joinees / max) * 100),
      color: colors[i % colors.length],
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/dashboard/today-interviews
export const getTodayInterviews = async (req, res) => {
  try {
    const { start, end } = todayRange();
    const interviews = await Interview.find({ date: { $gte: start, $lte: end } }).sort({ time: 1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/dashboard/recent-candidates
export const getRecentCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 }).limit(4);
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/dashboard/upcoming-followups
export const getUpcomingFollowups = async (req, res) => {
  try {
    const followups = await Followup.find({ status: { $ne: "Completed" } }).sort({ date: 1 }).limit(4);
    res.json(followups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/dashboard/recent-activities
export const getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(6);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
