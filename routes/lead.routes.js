import express from "express";

import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
  assignLead,
  addNote,
  getNotes,
  getLeadHistory,
  addLeadHostory,
  getLeadById,
} from "../controllers/lead.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

// CRUD
router.post("/", createLead);
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

// Assign
router.patch("/:id/assign", assignLead);

// Notes
router.post("/:id/notes", addNote);
router.get("/:id/notes", getNotes);

// History
router.get("/:id/history", getLeadHistory);
router.post("/:id/history", addLeadHostory);

export default router;