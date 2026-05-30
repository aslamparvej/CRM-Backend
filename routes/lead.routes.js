import express from "express";

import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
  assignLead,
  addNote,
  getLeadHistory,
} from "../controllers/lead.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

// CRUD
router.post("/", createLead);
router.get("/", getLeads);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

// Assign
router.patch("/:id/assign", assignLead);

// Notes
router.post("/:id/notes", addNote);

// History
router.get("/:id/history", getLeadHistory);

export default router;