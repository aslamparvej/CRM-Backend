import FollowUp from "../models/FollowUp.js";

// Create Follow Up
export const createFollowUp = async (req, res) => {
  try {
    const { leadId, followUpDate, note } = req.body;

    const followUp = await FollowUp.create({
      leadId,
      followUpDate,
      note,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Follow-Up created",
      data: followUp,
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
      .sort({ followUpDate: 1 });

    res.status(200).json({
      success: true,
      message: "Fetch Follow-Ups Successfully",
      data: followUps,
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
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { status: "done" },
      { new: true },
    );

    res.status().json({
      success: true,
      message: "Follow-Up completed",
      data: followUp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error when mark done",
    });
  }
};
