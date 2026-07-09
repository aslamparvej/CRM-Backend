import express from "express";
import {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  markFollowUpDone,
  getFollowUpByLeadId,
  updateFollowUp
} from "../controllers/followup.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createFollowUp);
router.get("/", getFollowUps);
router.get("/:id", getFollowUpById);
router.put("/:id", updateFollowUp);
router.patch("/:id/done", markFollowUpDone);
router.get("/lead/:leadId", getFollowUpByLeadId);

export default router;