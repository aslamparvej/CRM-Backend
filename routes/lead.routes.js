import express from "express";

import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
  assignLead,
  updateStatus,
  addNote,
  getNotes,
  getLeadHistory,
  addLeadHostory,
  getLeadById,
} from "../controllers/lead.controller.js";
import { verifyToken, authorizedRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

// CRUD
router.post("/", createLead);
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.put("/:id", authorizedRoles("admin"), updateLead);
router.delete("/:id", authorizedRoles("admin"), deleteLead);

// Assign
router.patch("/:id/assign", assignLead);
router.patch("/:id/status", updateStatus);

// Notes
router.post("/:id/notes", addNote);
router.get("/:id/notes", getNotes);

// History
router.get("/:id/history", getLeadHistory);
router.post("/:id/history", addLeadHostory);

export default router;