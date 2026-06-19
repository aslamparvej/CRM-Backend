import User from "../models/User.js";
import {
  getOverviewStats,
  getExecutivePerformance,
  getTodayExecutiveStats,
} from "../services/dashboard.service.js";

export const overview = async (req, res) => {
  try {
    const stats = await getOverviewStats(req.user);

    res.status(200).json({
      success: true,
      message: "Overview stats retrieved successfully",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Executive Stats
export const executiveStats = async (req, res) => {
  try {
    const data = await getExecutivePerformance();

    const populated = await Promise.all(
      data.map(async (item) => {
        const user = await User.findById(item._id).select("name");
        return {
          agentId: item._id,
          name: user?.name,
          totalLeads: item.totalLeads,
        };
      }),
    );

    res.status(200).json({
      success: true,
      message: "Executive stats retrieved successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Today's Executive Stats
export const todayExecutiveStats = async (req, res) => {
  try {
    const data = await getTodayExecutiveStats();

    const populated = await Promise.all(
      data.map(async (item) => {
        const user = await User.findById(item._id).select("name");

        return {
          agentId: item._id,
          name: user?.name,
          todayLeads: item.todayLeads,
        };
      }),
    );

    res.status(200).json({
      success: true,
      message: "Today's executive stats retrieved successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
