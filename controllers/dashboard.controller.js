import User from "../models/User.js";
import Lead from "../models/Lead.js";
import FollowUp from "../models/FollowUp.js";

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

// Today Leads
export const getTodayActivities = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let todayLeadsFilter = {
      isDeleted: { $ne: true },
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };
    if (req.user.role === "executive") {
      todayLeadsFilter.$or = [
        { createdBy: req.user.id },
        { assignedTo: req.user.id },
      ];
    }

    if (req.user.role === "sub-admin") {
      // Find users created by this sub-admin
      const users = await User.find({ createdBy: req.user.id }, "_id");

      const userIds = users.map((u) => u._id);

      todayLeadsFilter.createdBy = {
        $in: [req.user.id, ...userIds],
      };
    }

    const [todayLeads, followUps] = await Promise.all([
      Lead.find(todayLeadsFilter)
        .populate("assignedTo", "name email")
        .populate("status", "name")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .limit(10),

      FollowUp.find({
        scheduledAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
        .populate("leadId", "name phone status")
        .populate("createdBy", "name")
        .sort({ scheduledAt: 1 })
        .limit(10),
    ]);

    const todayFollowUps = followUps.map((followUp) => ({
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

    return res.status(200).json({
      success: true,
      message: "Fetch today's activity successcfully ",
      data: {
        todayLeads,
        todayFollowUps,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch today's activities",
    });
  }
};