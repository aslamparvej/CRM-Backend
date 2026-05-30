import express from "express";
import {
  createFollowUp,
  getFollowUps,
  markFollowUpDone,
} from "../controllers/followup.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createFollowUp);
router.get("/", getFollowUps);
router.patch("/:id/done", getFollowUps);

export default router;