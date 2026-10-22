// controllers/followupController.js
// CRUD for the Follow-up Tracker page, plus stats (4 top cards + summary
// donut) and insights (best time / avg response / most active assignee).
import Followup from "../models/Followup.js";

function dayRange(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export const getFollowups = async (req, res) => {
  try {
    const followups = await Followup.find().sort({ date: 1, time: 1 });
    res.json(followups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFollowupStats = async (req, res) => {
  try {
    const { start: todayStart, end: todayEnd } = dayRange(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { start: tomorrowStart, end: tomorrowEnd } = dayRange(tomorrow);

    const [today, tomorrowCount, overdue, completedToday, totalCount, pendingCount, completedCount, overdueCount] =
      await Promise.all([
        Followup.countDocuments({ date: { $gte: todayStart, $lte: todayEnd }, status: { $ne: "Completed" } }),
        Followup.countDocuments({ date: { $gte: tomorrowStart, $lte: tomorrowEnd } }),
        Followup.countDocuments({ status: "Overdue" }),
        Followup.countDocuments({ status: "Completed", updatedAt: { $gte: todayStart, $lte: todayEnd } }),
        Followup.countDocuments(),
        Followup.countDocuments({ status: "Pending" }),
        Followup.countDocuments({ status: "Completed" }),
        Followup.countDocuments({ status: "Overdue" }),
      ]);

    const pct = (n) => (totalCount > 0 ? Math.round((n / totalCount) * 100) : 0);

    res.json({
      today,
      tomorrow: tomorrowCount,
      overdue,
      completedToday,
      total: totalCount,
      summary: [
        { name: "Pending", value: pct(pendingCount), color: "#2563eb" },
        { name: "Completed", value: pct(completedCount), color: "#22b573" },
        { name: "Overdue", value: pct(overdueCount), color: "#ef4444" },
      ],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/followups/insights - all 3 numbers are genuinely computed:
// - bestTime: the most common hour among all follow-ups
// - avgResponseDays: average gap between creation and scheduled date, for
//   completed follow-ups only
// - topAssignee: whoever has the most follow-ups assigned to them
export const getFollowupInsights = async (req, res) => {
  try {
    const all = await Followup.find();

    if (all.length === 0) {
      return res.json({ bestTime: "N/A", avgResponseDays: 0, topAssignee: "N/A", topAssigneeCount: 0 });
    }

    const hourCounts = {};
    all.forEach((f) => {
      const match = f.time?.match(/(\d+):\d+\s*(AM|PM)/i);
      if (!match) return;
      let hour = parseInt(match[1], 10);
      if (/PM/i.test(match[2]) && hour !== 12) hour += 12;
      if (/AM/i.test(match[2]) && hour === 12) hour = 0;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const busiestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const bestTime = busiestHour
      ? `${formatHour(Number(busiestHour[0]))} - ${formatHour(Number(busiestHour[0]) + 3)}`
      : "N/A";

    const completed = all.filter((f) => f.status === "Completed");
    const avgResponseDays =
      completed.length > 0
        ? (
            completed.reduce((sum, f) => sum + (new Date(f.date) - new Date(f.createdAt)) / 86400000, 0) /
            completed.length
          ).toFixed(1)
        : 0;

    const assigneeCounts = {};
    all.forEach((f) => {
      if (!f.assignedTo) return;
      assigneeCounts[f.assignedTo] = (assigneeCounts[f.assignedTo] || 0) + 1;
    });
    const topEntry = Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1])[0];

    res.json({
      bestTime,
      avgResponseDays: Number(avgResponseDays),
      topAssignee: topEntry ? topEntry[0] : "N/A",
      topAssigneeCount: topEntry ? topEntry[1] : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function formatHour(hour24) {
  const h = ((hour24 % 24) + 24) % 24;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${period}`;
}

export const getFollowupById = async (req, res) => {
  try {
    const followup = await Followup.findById(req.params.id);
    if (!followup) return res.status(404).json({ message: "Follow-up not found" });
    res.json(followup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createFollowup = async (req, res) => {
  try {
    const newFollowup = await Followup.create(req.body);
    res.status(201).json(newFollowup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateFollowup = async (req, res) => {
  try {
    const updated = await Followup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteFollowup = async (req, res) => {
  try {
    await Followup.findByIdAndDelete(req.params.id);
    res.json({ message: "Follow-up deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/followups/bulk-delete - for the table's checkboxes
export const bulkDeleteFollowups = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No ids provided" });
    }
    await Followup.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} follow-up(s) deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};