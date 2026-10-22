// controllers/dailyActivityController.js
// CRUD for the Daily Activity page, plus 4 read-only summary endpoints
// that power the charts/cards: stats, overview (donut), trend (line
// chart), and priority-summary.
import DailyActivity from "../models/DailyActivity.js";

function dayRange(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export const getDailyActivities = async (req, res) => {
  try {
    const activities = await DailyActivity.find().sort({ date: 1, time: 1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDailyActivityStats = async (req, res) => {
  try {
    const [total, completed, inProgress, pending] = await Promise.all([
      DailyActivity.countDocuments(),
      DailyActivity.countDocuments({ status: "Completed" }),
      DailyActivity.countDocuments({ status: "In Progress" }),
      DailyActivity.countDocuments({ status: "Pending" }),
    ]);

    const pct = (n) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

    const { start, end } = dayRange(new Date());
    const todaysActivities = await DailyActivity.find({
      date: { $gte: start, $lte: end },
      status: { $ne: "Completed" },
    });

    const typeCounts = {};
    todaysActivities.forEach((a) => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });
    const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    const focusLabel = topTypes.length > 0 ? topTypes.slice(0, 2).map((t) => t[0]).join(" & ") : "No pending focus";

    const highPriorityToday = todaysActivities.filter((a) => a.priority === "High").length;

    res.json({
      total,
      completed,
      inProgress,
      pending,
      completedPct: pct(completed),
      inProgressPct: pct(inProgress),
      pendingPct: pct(pending),
      todaysFocus: focusLabel,
      todaysFocusHighPriorityCount: highPriorityToday,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getActivityOverview = async (req, res) => {
  try {
    const total = await DailyActivity.countDocuments();
    const grouped = await DailyActivity.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]);

    const colors = {
      "Client Call": "#2563eb",
      "Candidate Follow-up": "#22b573",
      Interview: "#f5a623",
      Networking: "#8b5cf6",
      "Other Activity": "#06b6d4",
    };

    const types = ["Client Call", "Candidate Follow-up", "Interview", "Networking", "Other Activity"];
    const data = types.map((type) => {
      const match = grouped.find((g) => g._id === type);
      const count = match ? match.count : 0;
      return {
        name: type,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
        color: colors[type],
      };
    });

    res.json({ total, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getActivityTrend = async (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await DailyActivity.countDocuments({ date: { $gte: dayStart, $lte: dayEnd } });
      data.push({ day: dayLabels[i], value: count });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPrioritySummary = async (req, res) => {
  try {
    const total = await DailyActivity.countDocuments();
    const grouped = await DailyActivity.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]);

    const priorities = ["High", "Medium", "Low", "No Priority"];
    const data = priorities.map((p) => {
      const match = grouped.find((g) => g._id === p);
      const count = match ? match.count : 0;
      return { name: p, count, percent: total > 0 ? Math.round((count / total) * 1000) / 10 : 0 };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTodaySchedule = async (req, res) => {
  try {
    const { start, end } = dayRange(new Date());
    const schedule = await DailyActivity.find({ date: { $gte: start, $lte: end } }).sort({ time: 1 });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDailyActivityById = async (req, res) => {
  try {
    const activity = await DailyActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createDailyActivity = async (req, res) => {
  try {
    const newActivity = await DailyActivity.create(req.body);
    res.status(201).json(newActivity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateDailyActivity = async (req, res) => {
  try {
    const updated = await DailyActivity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteDailyActivity = async (req, res) => {
  try {
    await DailyActivity.findByIdAndDelete(req.params.id);
    res.json({ message: "Activity deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};