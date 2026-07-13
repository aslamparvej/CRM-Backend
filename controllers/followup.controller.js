import mongoose from "mongoose";

import Lead from "../models/Lead.js";
import FollowUp from "../models/FollowUp.js";
import LeadHistory from "../models/LeadHistory.js";

import { ACTIVITY } from "../constants/activity.constants.js";
import { logActivity } from "../utils/activityLogger.js";

// Create Follow Up
export const createFollowUp = async (req, res) => {
  try {
    const { leadId, scheduledAt, note, type } = req.body;

    if (!leadId || !scheduledAt || !type) {
      return res.status(400).json({
        success: false,
        message: "Lead, schedule date and type are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead ID.",
      });
    }

    const lead = await Lead.findById(leadId, "name");
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    const followUp = await FollowUp.create({
      leadId,
      scheduledAt,
      note,
      type,
      createdBy: req.user.id,
    });

    const populatedFollowUp = await FollowUp.findById(followUp._id)
      .populate("leadId", "name phone")
      .populate("createdBy", "name");

    const formattedFollowUp = {
      id: populatedFollowUp._id,
      leadId: populatedFollowUp.leadId?._id,
      leadName: populatedFollowUp.leadId?.name || "",
      leadPhone: populatedFollowUp.leadId?.phone || "",
      type: populatedFollowUp.type,
      scheduledAt: populatedFollowUp.scheduledAt,
      note: populatedFollowUp.note,
      status: populatedFollowUp.status,
      completedAt: populatedFollowUp.completedAt,
      createdBy: populatedFollowUp.createdBy?._id || "",
      createdByName: populatedFollowUp.createdBy?.name || "",
      createdAt: populatedFollowUp.createdAt,
    };

    await LeadHistory.create({
      leadId: lead._id,
      action: "follow_up",
      newValue: JSON.stringify({
        type: followUp.type,
        scheduledAt: followUp.scheduledAt,
        status: followUp.status,
      }),
      changedBy: req.user.id,
    });

    // Create user activity log
    await logActivity({
      req,
      module: "FollowUp",
      action: ACTIVITY.FOLLOWUP.CREATE,
      targetId: followUp._id,
      targetName: lead.name,
      description: `Created a ${followUp.type} follow-up for ${lead.name}`,
      metadata: {
        leadId: lead._id,
        followUpId: followUp._id,
        type: followUp.type,
        scheduledAt: followUp.scheduledAt,
      },
    });

    res.status(201).json({
      success: true,
      message: "Follow-Up created successfully",
      data: formattedFollowUp,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error when creating follow-up",
    });
  }
};

// Get Follow Ups
export const getFollowUps = async (req, res) => {
  try {
    const { status } = req.query;

    const leads = await Lead.find({ assignedTo: req.user.id }, "_id");
    const leadIds = leads.map((lead) => lead._id);

    const filter = {
      leadId: { $in: leadIds },
    };
    if (status) filter.status = status;
    // filter.createdBy = req.user.id;

    const followUps = await FollowUp.find(filter)
      .populate("leadId", "name phone")
      .populate("createdBy", "name")
      .sort({ followUpDate: -1 });

    const formattedFollowUps = followUps.map((followUp) => ({
      id: followUp._id,
      leadId: followUp.leadId?._id,
      leadName: followUp.leadId?.name || "",
      leadPhone: followUp.leadId?.phone || "",
      type: followUp.type,
      scheduledAt: followUp.scheduledAt,
      note: followUp.note,
      status: followUp.status,
      completedAt: followUp.completedAt,
      createdBy: followUp.createdBy?._id || "",
      createdByName: followUp.createdBy?.name || "",
      createdAt: followUp.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Fetch Follow-Ups Successfully",
      data: formattedFollowUps,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error when fetching follow-ups",
    });
  }
};

// Mark Done
export const markFollowUpDone = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Follow Up ID",
      });
    }

    const followUp = await FollowUp.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Follow Up completed successfully",
      data: followUp,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error when mark done",
    });
  }
};

// Get Follow Up by Lead ID
export const getFollowUpByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Check invalid id
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Lead ID",
      });
    }

    // Find Follow-Up by Lead id
    const followUp = await FollowUp.findOne({ leadId })
      .populate("leadId", "name phone")
      .populate("createdBy", "name")
      .lean();

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow Up not found",
      });
    }

    const formattedFollowUp = {
      id: followUp._id,
      leadId: followUp.leadId?._id,
      leadName: followUp.leadId?.name || "",
      leadPhone: followUp.leadId?.phone || "",
      type: followUp.type,
      scheduledAt: followUp.scheduledAt,
      note: followUp.note,
      status: followUp.status,
      completedAt: followUp.completedAt,
      createdBy: followUp.createdBy?._id || "",
      createdByName: followUp.createdBy?.name || "",
      createdAt: followUp.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Fetch Follow-Up Successfully",
      data: formattedFollowUp,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error when fetching follow-up",
    });
  }
};

// Get Follow Up by ID
export const getFollowUpById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check invalid id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Follow Up ID",
      });
    }

    // Find Follow-Up by ID
    const followUp = await FollowUp.findById(id)
      .populate("leadId", "name phone")
      .populate("createdBy", "name")
      .lean();

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow Up not found",
      });
    }

    const formattedFollowUp = {
      id: followUp._id,
      leadId: followUp.leadId?._id,
      leadName: followUp.leadId?.name || "",
      leadPhone: followUp.leadId?.phone || "",
      type: followUp.type,
      scheduledAt: followUp.scheduledAt,
      note: followUp.note,
      status: followUp.status,
      completedAt: followUp.completedAt,
      createdBy: followUp.createdBy?._id || "",
      createdByName: followUp.createdBy?.name || "",
      createdAt: followUp.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Fetch Follow-Up Successfully",
      data: formattedFollowUp,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Error when fetching follow-up",
    });
  }
};

// Update Follow Up
export const updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, note, type } = req.body;

    // Check invalid id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Follow Up ID",
      });
    }

    // Find Follow-Up by ID
    const followUp = await FollowUp.findById(id)
      .populate("leadId", "name phone")
      .populate("createdBy", "name");

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow Up not found",
      });
    }

    const oldData = {
      scheduledAt: followUp.scheduledAt,
      type: followUp.type,
      note: followUp.note,
      status: followUp.status,
    };

    // Update Follow-Up
    followUp.scheduledAt = scheduledAt || followUp.scheduledAt;
    followUp.note = note || followUp.note;
    followUp.type = type || followUp.type;
    followUp.status = "rescheduled";

    await followUp.save();

    // Creating user activity log
    await logActivity({
      req,
      module: "FollowUp",
      action: ACTIVITY.FOLLOWUP.UPDATE,
      targetId: followUp._id,
      targetName: followUp.leadId?.name,
      description: `Updated follow-up for ${followUp.leadId?.name}`,
      metadata: {
        leadId: followUp.leadId?._id,
        followUpId: followUp._id,
        old: {
          scheduledAt: oldData.scheduledAt,
          type: oldData.type,
          note: oldData.note,
          status: oldData.status,
        },
        new: {
          scheduledAt: followUp.scheduledAt,
          type: followUp.type,
          note: followUp.note,
          status: followUp.status,
        },
      },
    });

    await LeadHistory.create({
      leadId: followUp.leadId._id,
      action: "follow_up_updated",
      previousValue: JSON.stringify({
        scheduledAt: oldData.scheduledAt,
        type: oldData.type,
        note: oldData.note,
        status: oldData.status,
      }),
      newValue: JSON.stringify({
        scheduledAt: followUp.scheduledAt,
        type: followUp.type,
        note: followUp.note,
        status: followUp.status,
      }),
      changedBy: req.user.id,
    });

    const formattedFollowUp = {
      id: followUp._id,
      leadId: followUp.leadId?._id,
      leadName: followUp.leadId?.name || "",
      leadPhone: followUp.leadId?.phone || "",
      type: followUp.type,
      scheduledAt: followUp.scheduledAt,
      note: followUp.note,
      status: followUp.status,
      completedAt: followUp.completedAt,
      createdBy: followUp.createdBy?._id || "",
      createdByName: followUp.createdBy?.name || "",
      createdAt: followUp.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Follow Up updated successfully",
      data: formattedFollowUp,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
