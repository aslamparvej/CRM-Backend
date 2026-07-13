import Lead from "../models/Lead.js";
import Note from "../models/Note.js";
import LeadHistory from "../models/LeadHistory.js";
import { buildFilterQuery } from "../services/lead.service.js";

import { ACTIVITY } from "../constants/activity.constants.js";
import { logActivity } from "../utils/activityLogger.js";

import { notifyLeadAssigned } from "../services/notification.service.js";

// Create Lead
export const createLead = async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user.id,
    });

    await lead.populate([
      { path: "assignedTo", select: "name email" },
      { path: "status", select: "name" },
    ]);

    // Creating Lead History
    await LeadHistory.create({
      leadId: lead._id,
      action: "Created",
      newValue: JSON.stringify(lead),
      changedBy: req.user.id,
    });

    // Creating User Activity
    await logActivity({
      req,
      module: "Lead",
      action: ACTIVITY.LEAD.CREATE,
      targetId: lead._id,
      targetName: lead.name,
      description: `Created lead ${lead.name}`,
      metadata: {
        mobile: lead.mobile,
        status: lead.status,
        assignedTo: lead.assignedTo,
      },
    });

    res.status(201).json({
      success: true,
      message: "Lead Created",
      data: lead,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error when creating lead",
    });
  }
};

// Get Lead (with filters)
export const getLeads = async (req, res) => {
  try {
    const filter = await buildFilterQuery(req.query, req.user);

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .populate("status", "name")
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

// Get Lead by Id
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("status", "name")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error when fetching lead",
    });
  }
};

// Update Lead
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    const oldLead = await Lead.findById(req.params.id);

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

    // Creating User Activity
    await logActivity({
      req,
      module: "Lead",
      action: ACTIVITY.LEAD.UPDATE,
      targetId: lead._id,
      targetName: lead.name,
      description: `Updated lead ${lead.name}`,
      metadata: {
        before: oldLead,
        after: lead,
      },
    });

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

// Assign Lead
export const assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true },
    );

    // Creating Lead History
    await LeadHistory.create({
      leadId: lead._id,
      action: "assigned",
      newValue: assignedTo,
      changedBy: req.user.id,
    });

    // Creating User Activity
    await logActivity({
      req,
      module: "Lead",
      action: ACTIVITY.LEAD.ASSIGN,
      targetId: lead._id,
      targetName: lead.name,
      description: `Assigned lead to another user`,
      metadata: {
        newAssignedTo: assignedTo,
      },
    });

    // Creating notification
    notifyLeadAssigned(lead, assignedTo);

    res.status(200).json({
      success: true,
      message: "Lead assigned",
      data: lead,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error when asssig lead",
    });
  }
};

// Update Lead Status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Get lead with current status
    const lead = await Lead.findById(req.params.id).populate("status", "name");
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    const oldStatus = lead.status;

    // Update status
    lead.status = status;
    await lead.save();

    // Populate new status
    await lead.populate("status", "name");

    // Creating Lead History
    await LeadHistory.create({
      leadId: lead._id,
      action: "updated_status",
      oldValue: oldStatus._id,
      newValue: lead.status._id,
      changedBy: req.user.id,
    });

    // Creating user activity
    await logActivity({
      req,
      module: "Lead",
      action: ACTIVITY.LEAD.STATUS,
      targetId: lead._id,
      targetName: lead.name,
      description: `Changed status from ${oldStatus.name} to ${lead.status.name}`,
      metadata: {
        oldStatus: {
          id: oldStatus._id,
          name: oldStatus.name,
        },
        newStatus: {
          id: lead.status._id,
          name: lead.status.name,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Lead status updated successfully.",
      data: lead,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Note
export const addNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id, "name");
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    // Creating note
    const note = await Note.create({
      leadId: lead._id,
      text: req.body.content,
      createdBy: req.user.id,
    });
    await note.populate("createdBy", "name email");

    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }
    await LeadHistory.create({
      leadId: req.params.id,
      action: "note_added",
      newValue: req.body.content,
      changedBy: req.user.id,
    });

    // Creating User Activity
    await logActivity({
      req,
      module: "Note",
      action: ACTIVITY.NOTE.CREATE,
      targetId: note._id,
      targetName: lead?.name,
      description: `Added a note to lead "${lead?.name}"`,
      metadata: {
        leadId: lead?._id,
        noteId: note._id,
        content: note.text,
      },
    });

    const formattedNote = {
      id: note._id,
      leadId: note.leadId,
      content: note.text,
      createdBy: note.createdBy._id,
      createdByName: note.createdBy.name,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "Note added successfully.",
      data: formattedNote,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ leadId: req.params.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const formattedNotes = notes.map((note) => ({
      id: note._id,
      leadId: note.leadId,
      content: note.text,
      createdBy: note.createdBy?._id,
      createdByName: note.createdBy?.name || "Unknown User",
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedNotes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Lead History
export const getLeadHistory = async (req, res) => {
  try {
    const history = await LeadHistory.find({ leadId: req.params.id })
      .populate("changedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error when getting lead history",
    });
  }
};

// Add Lead History
export const addLeadHostory = async (req, res) => {
  try {
    const hostory = await LeadHistory.create({
      leadId: req.params.id,
      action: req.body.action,
      changedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "History created",
      data: hostory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log(error.message);
  }
};
