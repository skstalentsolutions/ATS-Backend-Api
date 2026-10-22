// controllers/interviewController.js
// CRUD for the Interview Management page, plus a stats endpoint for its
// 5 top cards (Today / Tomorrow / This Week / Pending Feedback / Completed).
import Interview from "../models/Interview.js";

// Small date-range helpers, same pattern as dashboardController.js
function dayRange(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function weekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function thisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// GET /api/interviews - full list (filtering happens on the frontend,
// same pattern as the Clients page, since the dataset is small)
export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ date: 1, time: 1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/interviews/stats - the 5 top cards
export const getInterviewStats = async (req, res) => {
  try {
    const { start: todayStart, end: todayEnd } = dayRange(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { start: tomorrowStart, end: tomorrowEnd } = dayRange(tomorrow);
    const { start: weekStart, end: weekEnd } = weekRange();
    const { start: monthStart, end: monthEnd } = thisMonthRange();

    const [today, tomorrowCount, thisWeek, totalCount, pendingFeedback, completedThisMonth] = await Promise.all([
      Interview.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
      Interview.countDocuments({ date: { $gte: tomorrowStart, $lte: tomorrowEnd } }),
      Interview.countDocuments({ date: { $gte: weekStart, $lte: weekEnd } }),
      Interview.countDocuments(),
      Interview.countDocuments({ status: "Pending Feedback" }),
      Interview.countDocuments({ status: "Completed", date: { $gte: monthStart, $lte: monthEnd } }),
    ]);

    res.json({
      today,
      tomorrow: tomorrowCount,
      thisWeek,
      thisWeekPercent: totalCount > 0 ? Math.round((thisWeek / totalCount) * 100) : 0,
      pendingFeedback,
      completedThisMonth,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/interviews/:id - one interview's full details (right-hand panel)
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/interviews - schedule a new interview
export const createInterview = async (req, res) => {
  try {
    const newInterview = await Interview.create(req.body);
    res.status(201).json(newInterview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/interviews/:id - edit an interview, or change its status
// (used both by the full edit form AND the quick "Mark Completed" /
// "Cancel" actions in the row's "..." menu)
export const updateInterview = async (req, res) => {
  try {
    const updated = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/interviews/:id
export const deleteInterview = async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: "Interview deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};