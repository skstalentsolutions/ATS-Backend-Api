// controllers/joiningController.js
import Joining from "../models/Joining.js";

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

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export const getJoinings = async (req, res) => {
  try {
    const joinings = await Joining.find().sort({ doj: 1 });
    res.json(joinings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJoiningStats = async (req, res) => {
  try {
    const [totalSelected, joined, yetToJoin, noShow, offerDrop] = await Promise.all([
      Joining.countDocuments(),
      Joining.countDocuments({ status: "Joined" }),
      Joining.countDocuments({ status: "Yet to Join" }),
      Joining.countDocuments({ status: "No Show" }),
      Joining.countDocuments({ status: "Offer Drop" }),
    ]);

    const pct = (n) => (totalSelected > 0 ? Math.round((n / totalSelected) * 1000) / 10 : 0);

    const { start: todayStart, end: todayEnd } = dayRange(new Date());
    const { start: weekStart, end: weekEnd } = weekRange();
    const { start: monthStart, end: monthEnd } = monthRange();

    const [todayDOJ, thisWeek, thisMonth, overdue] = await Promise.all([
      Joining.countDocuments({ doj: { $gte: todayStart, $lte: todayEnd } }),
      Joining.countDocuments({ doj: { $gte: weekStart, $lte: weekEnd } }),
      Joining.countDocuments({ doj: { $gte: monthStart, $lte: monthEnd } }),
      Joining.countDocuments({ status: "Yet to Join", doj: { $lt: todayStart } }),
    ]);

    res.json({
      totalSelected,
      joined,
      yetToJoin,
      noShow,
      offerDrop,
      summary: [
        { name: "Joined", value: pct(joined), color: "#22b573" },
        { name: "Yet to Join", value: pct(yetToJoin), color: "#f5a623" },
        { name: "No Show", value: pct(noShow), color: "#ef4444" },
        { name: "Offer Drop", value: pct(offerDrop), color: "#8b5cf6" },
      ],
      quickFilters: { todayDOJ, thisWeek, thisMonth, overdue },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecentJoinings = async (req, res) => {
  try {
    const recent = await Joining.find({ status: "Joined" }).sort({ doj: -1 }).limit(3);
    res.json(recent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJoiningById = async (req, res) => {
  try {
    const joining = await Joining.findById(req.params.id);
    if (!joining) return res.status(404).json({ message: "Joining record not found" });
    res.json(joining);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createJoining = async (req, res) => {
  try {
    const newJoining = await Joining.create(req.body);
    res.status(201).json(newJoining);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateJoining = async (req, res) => {
  try {
    const updated = await Joining.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteJoining = async (req, res) => {
  try {
    await Joining.findByIdAndDelete(req.params.id);
    res.json({ message: "Joining record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};