import LeadStatus from "../models/LeadStatus.js";

export const getLeadStatuses = async (req, res) => {
  try {
    const statuses = await LeadStatus.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: statuses,
      message: "Fetch statuses successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
