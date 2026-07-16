import Lead from "../models/Lead.js";
import User from "../models/User.js";
import FollowUp from "../models/FollowUp.js";
import { buildLeadFilter, buildFollowupFilter } from "../helpers/filter.js";

export const getOverviewStats = async (user) => {
  try {
    const match = await buildLeadFilter(user);
    const followupMatch = await buildFollowupFilter();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Getting leads stata
    const totalLeads = await Lead.countDocuments(match);
    const todayLeads = await Lead.countDocuments({
      ...match,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Getting follow-ups stats
    const totalFollowups = await FollowUp.countDocuments(followupMatch);
    const todayFollowups = await FollowUp.countDocuments({
      ...followupMatch,
      scheduledAt: { $gte: todayStart, $lte: todayEnd },
    });

    const statusBreakdown = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "leadstatuses",
          localField: "_id",
          foreignField: "_id",
          as: "status",
        },
      },
      {
        $unwind: "$status",
      },
      {
        $project: {
          _id: 0,
          statusId: "$status._id",
          name: "$status.name",
          color: "$status.color",
          order: "$status.order",
          isClosed: "$status.isClosed",
          count: 1,
        },
      },
      {
        $sort: {
          order: 1,
        },
      },
    ]);
    const wonLeads =
      statusBreakdown.find((status) => status.name === "Won")?.count || 0;
    const conversionRate = wonLeads === 0 ? 0 : Number(((wonLeads / totalLeads) * 100).toFixed(2));

    const categoryBreakdown = await Lead.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    let subAdminFilter = {
      isActive: true,
      role: "sub-admin",
    };
    let executiveFilter = {
      isActive: true,
      role: "executive",
    };

    if (user.role === "sub-admin") {
      subAdminFilter.createdBy = user.id;
      executiveFilter.createdBy = user.id;
    }
    const subAdminCount = await User.countDocuments(subAdminFilter);
    const executiveCount = await User.countDocuments(executiveFilter);

    if (user.role == "executive") {
      return {
        totalLeads,
        todayLeads,
        totalFollowups,
        todayFollowups,
        statusBreakdown,
        categoryBreakdown,
        conversionRate
      };
    }

    return {
      totalLeads,
      todayLeads,
      totalFollowups,
      todayFollowups,
      statusBreakdown,
      categoryBreakdown,
      subAdminCount,
      executiveCount,
      conversionRate
    };
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    res.startus(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExecutivePerformance = () => {
  return Lead.aggregate([
    { $match: { isDeleted: false, assignedTo: { $ne: null } } },
    {
      $group: {
        _id: "$assignedTo",
        totalLeads: { $sum: 1 },
      },
    },
  ]);
};

export const getTodayExecutiveStats = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return Lead.aggregate([
    {
      $match: {
        isDeleted: false,
        assignedTo: { $ne: null },
        createdAt: { $gte: start, $lte: end },
      },
    },

    {
      $group: {
        _id: "$assignedTo",
        totalLeads: { $sum: 1 },
      },
    },
  ]);
};
