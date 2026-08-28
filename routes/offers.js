import express from "express";
import Offer from "../models/Offer.js";

const router = express.Router();

// @route   GET /api/offers/stats
// @desc    Get aggregate stats for offer management
router.get("/stats", async (req, res) => {
  try {
    const total = await Offer.countDocuments();
    const stats = await Offer.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusMap = {
      Accepted: 0,
      Pending: 0,
      Declined: 0,
      Withdrawn: 0,
    };

    stats.forEach((s) => {
      if (s._id in statusMap) {
        statusMap[s._id] = s.count;
      }
    });

    const sent = statusMap.Accepted + statusMap.Pending + statusMap.Declined + statusMap.Withdrawn;

    res.json({
      total,
      sent,
      pending: statusMap.Pending,
      accepted: statusMap.Accepted,
      declined: statusMap.Declined,
      withdrawn: statusMap.Withdrawn,
    });
  } catch (error) {
    console.error("GET Offer Stats Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/offers
// @desc    Get all offers with optional search/filter query params
router.get("/", async (req, res) => {
  try {
    const { search, status, client, jobTitle, assignedTo } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { candidateName: regex },
        { jobTitle: regex },
        { client: regex },
        { offerId: regex },
        { candidateEmail: regex },
        { candidatePhone: regex },
      ];
    }

    if (status && status !== "All Status") {
      filter.status = status;
    }

    if (client && client !== "All Clients" && client !== "All") {
      filter.client = client;
    }

    if (jobTitle && jobTitle !== "All Jobs" && jobTitle !== "All") {
      filter.jobTitle = jobTitle;
    }

    if (assignedTo && assignedTo !== "All Users" && assignedTo !== "All") {
      filter["assignedTo.name"] = assignedTo;
    }

    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error("GET Offers Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/offers/:id
// @desc    Get single offer by ID
router.get("/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.json(offer);
  } catch (error) {
    console.error("GET Offer Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/offers
// @desc    Create a new offer
router.post("/", async (req, res) => {
  try {
    const { candidateName, jobTitle, client, ctc } = req.body;

    if (!candidateName || !jobTitle || !client || !ctc) {
      return res.status(400).json({ message: "Please provide candidateName, jobTitle, client, and ctc" });
    }

    // Auto-generate offerId if not provided
    if (!req.body.offerId) {
      const count = await Offer.countDocuments();
      const nextNum = String(count + 1).padStart(5, "0");
      const currentYear = new Date().getFullYear();
      req.body.offerId = `OFF-${currentYear}-${nextNum}`;
    }

    // Set default historical events if not provided
    if (!req.body.history || req.body.history.length === 0) {
      const nowStr = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + `, ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
      
      const creatorName = req.body.assignedTo?.name || "Sanjay Kushwaha";
      const creatorRole = req.body.assignedTo?.role || "Super Admin";

      const initialHistory = [
        {
          event: "Offer Created",
          date: nowStr,
          user: `${creatorName} (${creatorRole})`,
        }
      ];

      if (req.body.status !== "Draft") {
        initialHistory.push({
          event: "Offer Sent",
          date: nowStr,
          user: `${creatorName} (${creatorRole})`,
        });
      }

      req.body.history = initialHistory;
    }

    const offer = new Offer(req.body);
    const saved = await offer.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST Offer Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/offers/bulk
// @desc    Bulk import/seed offers
router.post("/bulk", async (req, res) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) {
      return res.status(400).json({ message: "Request body must be an array of offers" });
    }
    const saved = await Offer.insertMany(list);
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST Bulk Offers Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/offers/:id
// @desc    Update offer fields
router.put("/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // If status transitions from Draft to Pending, append "Offer Sent" event to history
    if (req.body.status === "Pending" && offer.status === "Draft") {
      const nowStr = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + `, ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
      
      const updaterName = req.body.assignedTo?.name || offer.assignedTo?.name || "Sanjay Kushwaha";
      const updaterRole = req.body.assignedTo?.role || offer.assignedTo?.role || "Super Admin";

      let historyList = req.body.history || offer.history || [];
      const alreadySent = historyList.some((h) => h.event === "Offer Sent");
      if (!alreadySent) {
        historyList.push({
          event: "Offer Sent",
          date: nowStr,
          user: `${updaterName} (${updaterRole})`,
        });
        req.body.history = historyList;
      }
      
      // Also set sentOn date if not present
      if (!req.body.sentOn) {
        req.body.sentOn = nowStr;
      }
    }

    const updated = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("PUT Offer Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PATCH /api/offers/:id/status
// @desc    Update status of an offer (Accept, Decline, Withdraw)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Accepted", "Pending", "Declined", "Withdrawn"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    offer.status = status;

    const nowStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + `, ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    if (status === "Accepted") {
      offer.responseOn = nowStr;
      offer.history.push({
        event: "Offer Accepted",
        date: nowStr,
        user: `${offer.candidateName} (Candidate)`,
      });
    } else if (status === "Declined") {
      offer.responseOn = nowStr;
      offer.history.push({
        event: "Offer Declined",
        date: nowStr,
        user: `${offer.candidateName} (Candidate)`,
      });
    } else if (status === "Withdrawn") {
      offer.history.push({
        event: "Offer Withdrawn",
        date: nowStr,
        user: `${offer.assignedTo.name} (${offer.assignedTo.role})`,
      });
    }

    const updated = await offer.save();
    res.json(updated);
  } catch (error) {
    console.error("PATCH Offer Status Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/offers/:id
// @desc    Delete an offer
router.delete("/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: "Offer successfully deleted", id: req.params.id });
  } catch (error) {
    console.error("DELETE Offer Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
