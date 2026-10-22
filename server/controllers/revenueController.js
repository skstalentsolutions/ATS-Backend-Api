// controllers/revenueController.js
// CRUD for the Revenue Tracker page, plus 5 read-only summary endpoints:
// stats (5 top cards), overview (monthly trend line), by-type (donut),
// payment-status (donut), top-clients, and summary (This Month/Last
// Month/This Quarter/This FY cards).
import Revenue from "../models/Revenue.js";
import Client from "../models/Client.js";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Recruiter from "../models/Recruiter.js";
import Joining from "../models/Joining.js";

const billedFilter = { status: { $ne: "Draft" } };

function normalizeRevenueBody(body, { isDraft }) {
  const amount = Number(body.amount) || 0;
  const tax = Number(body.tax) || 0;
  const netAmount = Math.round((amount + tax) * 100) / 100;

  let commissionPercent = Number(body.commissionPercent) || 0;
  let commissionAmount = Number(body.commissionAmount) || 0;
  const hasAssociate = Boolean(body.hasAssociate);

  if (hasAssociate && body.commissionType === "Percentage") {
    commissionAmount = Math.round(((amount * commissionPercent) / 100) * 100) / 100;
  }

  let status = body.status === "Received" ? "Paid" : body.status || "Pending";
  if (isDraft) status = "Draft";

  let invoiceNo = (body.invoiceNo || "").trim();
  if (!invoiceNo) {
    invoiceNo = isDraft ? `DRAFT-${Date.now()}` : "";
  }

  return {
    invoiceNo,
    client: body.client || (isDraft ? "Draft Client" : ""),
    jobService: body.jobService || "",
    revenueType: body.revenueType || "Placement Fees",
    invoiceDate: body.invoiceDate || new Date(),
    amount,
    tax,
    netAmount,
    status,
    paymentDate: body.paymentDate || null,
    remarks: body.remarks || "",
    poContractNo: body.poContractNo || "",
    billingCurrency: body.billingCurrency || "INR",
    exchangeRate: Number(body.exchangeRate) || 1,
    paymentMode: body.paymentMode || "Bank Transfer",
    paymentReference: body.paymentReference || "",
    candidateName: body.candidateName || "",
    candidateStatus: body.candidateStatus || "",
    doj: body.doj || null,
    offeredCtc: Number(body.offeredCtc) || 0,
    source: body.source || "",
    hasAssociate,
    associateName: hasAssociate ? body.associateName || "" : "",
    commissionType: body.commissionType || "Percentage",
    commissionPercent: hasAssociate ? commissionPercent : 0,
    commissionAmount: hasAssociate ? commissionAmount : 0,
    attachments: Array.isArray(body.attachments) ? body.attachments : [],
    isDraft: Boolean(isDraft),
  };
}

function monthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

async function sumAmount(filter) {
  const result = await Revenue.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
  return result[0]?.total || 0;
}

export const getRevenues = async (req, res) => {
  try {
    const revenues = await Revenue.find().sort({ invoiceDate: -1 });
    res.json(revenues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const now = new Date();
    const { start: thisMonthStart, end: thisMonthEnd } = monthRange(now.getFullYear(), now.getMonth());
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const { start: lastMonthStart, end: lastMonthEnd } = monthRange(lastMonthDate.getFullYear(), lastMonthDate.getMonth());

    const [totalRevenue, paidRevenue, pendingRevenue, overdueRevenue, dealCount, thisMonthTotal, lastMonthTotal] =
      await Promise.all([
        sumAmount(billedFilter),
        sumAmount({ status: "Paid" }),
        sumAmount({ status: "Pending" }),
        sumAmount({ status: "Overdue" }),
        Revenue.countDocuments(billedFilter),
        sumAmount({ ...billedFilter, invoiceDate: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
        sumAmount({ ...billedFilter, invoiceDate: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      ]);

    const pct = (n) => (totalRevenue > 0 ? Math.round((n / totalRevenue) * 1000) / 10 : 0);
    const avgDealValue = dealCount > 0 ? Math.round(totalRevenue / dealCount) : 0;
    const momChange = lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 1000) / 10 : 0;

    res.json({
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      overdueRevenue,
      avgDealValue,
      paidPct: pct(paidRevenue),
      pendingPct: pct(pendingRevenue),
      overduePct: pct(overdueRevenue),
      momChangePct: momChange,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRevenueOverview = async (req, res) => {
  try {
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const { start, end } = monthRange(d.getFullYear(), d.getMonth());
      const total = await sumAmount({ ...billedFilter, invoiceDate: { $gte: start, $lte: end } });
      data.push({
        month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        value: total,
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRevenueByType = async (req, res) => {
  try {
    const total = await sumAmount(billedFilter);
    const grouped = await Revenue.aggregate([
      { $match: billedFilter },
      { $group: { _id: "$revenueType", total: { $sum: "$amount" } } },
    ]);

    const colors = {
      "Placement Fees": "#2563eb",
      "Consulting Fees": "#22b573",
      "Training Fees": "#f5a623",
      "Other Income": "#8b5cf6",
    };

    const types = ["Placement Fees", "Consulting Fees", "Training Fees", "Other Income"];
    const data = types.map((type) => {
      const match = grouped.find((g) => g._id === type);
      const amount = match ? match.total : 0;
      return {
        name: type,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
        color: colors[type],
      };
    });

    res.json({ total, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const total = await sumAmount(billedFilter);
    const grouped = await Revenue.aggregate([
      { $match: billedFilter },
      { $group: { _id: "$status", total: { $sum: "$amount" } } },
    ]);

    const colors = { Paid: "#22b573", Pending: "#f5a623", Overdue: "#ef4444" };
    const statuses = ["Paid", "Pending", "Overdue"];
    const data = statuses.map((status) => {
      const match = grouped.find((g) => g._id === status);
      const amount = match ? match.total : 0;
      return {
        name: status,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
        color: colors[status],
      };
    });

    res.json({ total, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTopClients = async (req, res) => {
  try {
    const total = await sumAmount(billedFilter);
    const grouped = await Revenue.aggregate([
      { $match: billedFilter },
      { $group: { _id: "$client", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    const data = grouped.map((g) => ({
      client: g._id,
      total: g.total,
      percent: total > 0 ? Math.round((g.total / total) * 1000) / 10 : 0,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRevenueSummary = async (req, res) => {
  try {
    const now = new Date();
    const { start: thisMonthStart, end: thisMonthEnd } = monthRange(now.getFullYear(), now.getMonth());
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const { start: lastMonthStart, end: lastMonthEnd } = monthRange(lastMonthDate.getFullYear(), lastMonthDate.getMonth());

    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
    const quarterEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999);

    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const fyStart = new Date(fyStartYear, 3, 1);
    const fyEnd = now;

    const [thisMonth, lastMonth, thisQuarter, thisFY] = await Promise.all([
      sumAmount({ ...billedFilter, invoiceDate: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
      sumAmount({ ...billedFilter, invoiceDate: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      sumAmount({ ...billedFilter, invoiceDate: { $gte: quarterStart, $lte: quarterEnd } }),
      sumAmount({ ...billedFilter, invoiceDate: { $gte: fyStart, $lte: fyEnd } }),
    ]);

    res.json({ thisMonth, lastMonth, thisQuarter, thisFY });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRevenueFormOptions = async (req, res) => {
  try {
    const [clients, jobs, candidates, recruiters, joinings] = await Promise.all([
      Client.find().select("company industry status").sort({ company: 1 }),
      Job.find().select("title client status").sort({ title: 1 }),
      Candidate.find().select("name position client recruiter status").sort({ name: 1 }),
      Recruiter.find().select("name avatar").sort({ name: 1 }),
      Joining.find().select("candidateName position client doj status workLocation").sort({ candidateName: 1 }),
    ]);

    res.json({ clients, jobs, candidates, recruiters, joinings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRevenueById = async (req, res) => {
  try {
    const revenue = await Revenue.findById(req.params.id);
    if (!revenue) return res.status(404).json({ message: "Revenue entry not found" });
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRevenue = async (req, res) => {
  try {
    const isDraft = Boolean(req.body.isDraft);
    const payload = normalizeRevenueBody(req.body, { isDraft });

    if (!isDraft) {
      if (!payload.invoiceNo) return res.status(400).json({ message: "Invoice No. is required" });
      if (!payload.client) return res.status(400).json({ message: "Client is required" });
      if (!payload.invoiceDate) return res.status(400).json({ message: "Revenue date is required" });
    }

    const newRevenue = await Revenue.create(payload);
    res.status(201).json(newRevenue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateRevenue = async (req, res) => {
  try {
    const isDraft = Boolean(req.body.isDraft);
    const payload = normalizeRevenueBody(req.body, { isDraft });

    if (!isDraft) {
      if (!payload.invoiceNo) return res.status(400).json({ message: "Invoice No. is required" });
      if (!payload.client) return res.status(400).json({ message: "Client is required" });
    }

    const updated = await Revenue.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Revenue entry not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteRevenue = async (req, res) => {
  try {
    await Revenue.findByIdAndDelete(req.params.id);
    res.json({ message: "Revenue entry deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};