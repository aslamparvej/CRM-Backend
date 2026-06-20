import express from "express";
import {
  overview,
  executiveStats,
  todayExecutiveStats,
  getTodayActivities
} from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Verify token
router.use(verifyToken);

// Dashboard routes
router.get("/overview", overview);
router.get("/executive", executiveStats);
router.get("/executive/today", todayExecutiveStats);

// router.get("/today-leads", (req, res)=> {
//   res.status(200).json({
//     success: true,
//     message: "Fetch today leads succcessfully",
//     data: [],
//   })
// })
router.get("/today-leads", getTodayActivities)
export default router;
