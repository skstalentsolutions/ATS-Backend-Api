// server/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getUserProfile);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/settings", updateUserProfile);

export default router;
