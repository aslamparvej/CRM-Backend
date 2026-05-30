import Lead from "../models/Lead.js";
import Note from "../models/Note.js";
import LeadHistory from "../models/LeadHistory.js";
import { buildFilterQuery } from "../services/lead.service.js";

// Create Lead
export const createLead = async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user.id,
    });

    await LeadHistory.create({
      leadId: lead._id,
      action: "Created",
      newValue: JSON.stringify(lead),
      changedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Lead Created",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error when creating lead",
    });
  }
};

// Get Lead (with filters)
export const getLeads = async (req, res) => {
  try {
    const filter = buildFilterQuery(req.query, req.user);

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error when fetching leads",
    });
  }
};

// Update Lead
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const oldStatus = lead.status;

    Object.assign(lead, req.body);
    await lead.save();

    // Track history (status change)
    if (req.body.status && req.body.status !== oldStatus) {
      await LeadHistory({
        leadId: lead._id,
        action: "status_changed",
        oldValue: oldStatus,
        newValue: req.body.status,
        changedBy: req.user.id,
      });
    }
    res.status(200).json({
      success: true,
      message: "Lead updated",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error when updating lead",
    });
  }
};

// Delete Lead (Soft delete)
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    lead.isDeleted = true;
    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error when delete lead",
    });
  }
};

// Assign Leads
export const assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true },
    );
    await LeadHistory.create({
      leadId: lead._id,
      action: "assigned",
      newValue: assignedTo,
      changedBy: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Lead assigned",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error when asssig lead",
    });
  }
};

// Add Note
export const addNote = async (req, res) => {
  try {
    const note = await Note.create({
      leadId: req.params.id,
      text: req.body.text,
      createdBy: req.user.id,
    });

    await LeadHistory.create({
      leadId: req.params.id,
      action: "note_added",
      newValue: req.body.text,
      changedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Note added",
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error when add note",
    });
  }
};

// Get Lead History
export const getLeadHistory = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error wheb getting lead history",
    });
  }
};
