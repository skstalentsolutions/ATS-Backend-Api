// server/routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  markAllRead,
  toggleRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.put("/mark-all-read", markAllRead);
router.put("/:id/read", toggleRead);
router.delete("/:id", deleteNotification);

export default router;
