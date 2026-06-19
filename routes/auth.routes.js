import express, { Router } from "express";
import {
  register,
  login,
  getProfile,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
import { verifyToken, authorizedRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Only admin/sub-admin can create users
router.post(
  "/register",
  verifyToken,
  authorizedRoles("admin", "sub-admin"),
  register,
);
// router.post("/register", register);

// Get Profile
router.get("/profile", verifyToken, getProfile);

export default router;
