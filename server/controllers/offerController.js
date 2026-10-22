// server/controllers/offerController.js
import Offer from "../models/Offer.js";

export const getOfferStats = async (req, res) => {
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
      Draft: 0,
      Sent: 0,
    };

    stats.forEach((s) => {
      if (s._id) {
        statusMap[s._id] = s.count;
      }
    });

    const sent = (statusMap.Accepted || 0) + (statusMap.Pending || 0) + (statusMap.Declined || 0) + (statusMap.Withdrawn || 0) + (statusMap.Sent || 0);

    res.json({
      total,
      sent,
      pending: statusMap.Pending || 0,
      accepted: statusMap.Accepted || 0,
      declined: statusMap.Declined || 0,
      withdrawn: statusMap.Withdrawn || 0,
    });
  } catch (error) {
    console.error("GET Offer Stats Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getOffers = async (req, res) => {
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

    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error("GET Offers Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getOfferById = async (req, res) => {
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
};

export const createOffer = async (req, res) => {
  try {
    const { candidateName, jobTitle, client, ctc } = req.body;

    if (!candidateName) {
      return res.status(400).json({ message: "Please provide candidateName" });
    }

    if (!req.body.offerId) {
      const count = await Offer.countDocuments();
      const nextNum = String(count + 1).padStart(5, "0");
      const currentYear = new Date().getFullYear();
      req.body.offerId = `OFF-${currentYear}-${nextNum}`;
    }

    const offer = new Offer(req.body);
    const saved = await offer.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST Offer Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const bulkImportOffers = async (req, res) => {
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
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
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
};

export const updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Accepted", "Pending", "Declined", "Withdrawn", "Draft", "Sent", "Revoked"];

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
    const updated = await offer.save();
    res.json(updated);
  } catch (error) {
    console.error("PATCH Offer Status Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteOffer = async (req, res) => {
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
};
