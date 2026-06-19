import mongoose from "mongoose";

import FollowUp from "../models/FollowUp.js";
import LeadHistory from "../models/LeadHistory.js";

// Create Follow Up
export const createFollowUp = async (req, res) => {
  try {
    const { leadId, scheduledAt, note, type } = req.body;

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
      leadId: leadId,
      action: "follow_up",
      newValue: JSON.stringify(formattedFollowUp),
      changedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Follow-Up created successfully",
      data: formattedFollowUp,
    });
  } catch (error) {
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

    const filter = {};
    if (status) filter.status = status;

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
    res.status(500).json({
      success: false,
      message: error.message || "Error when mark done",
    });

    console.log(error.message);
  }
};
