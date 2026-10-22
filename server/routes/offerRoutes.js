// server/routes/offerRoutes.js
import express from "express";
import {
  getOfferStats,
  getOffers,
  getOfferById,
  createOffer,
  bulkImportOffers,
  updateOffer,
  updateOfferStatus,
  deleteOffer,
} from "../controllers/offerController.js";

const router = express.Router();

router.get("/stats", getOfferStats);
router.get("/", getOffers);
router.get("/:id", getOfferById);
router.post("/", createOffer);
router.post("/bulk", bulkImportOffers);
router.put("/:id", updateOffer);
router.patch("/:id/status", updateOfferStatus);
router.delete("/:id", deleteOffer);

export default router;
