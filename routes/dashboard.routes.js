import express from "express";
import {
  overview,
  executiveStats,
  todayExecutiveStats,
} from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Verify token
router.use(verifyToken);

// Dashboard routes
router.get("/overview", overview);
router.get("/executive", executiveStats);
router.get("/executive/today", todayExecutiveStats);

export default router;
