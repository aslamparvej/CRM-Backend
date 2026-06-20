import Lead from "../models/Lead.js";
import User from "../models/User.js";

export const getOverviewStats = async (user) => {
  const match = { isDeleted: false };

  // Role based filter
  if (user.role === "executive") {
    match.assignedTo = user.id;
    match.createdBy = user.id;
  }
  if(user.role === "sub-admin"){
    match.createdBy = user.id;
    match.assignedTo = user.id;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const totalLeads = await Lead.countDocuments(match);
  const todayLeads = await Lead.countDocuments({
    ...match,
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });


  const statusBreakdown = await Lead.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryBreakdown = await Lead.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const subAdminCount = await User.countDocuments({
    isActive: true,
    role: "sub-admin",
  });
  const executiveCount = await User.countDocuments({
    isActive: true,
    role: "executive",
  });

  return {
    totalLeads,
    todayLeads,
    statusBreakdown,
    categoryBreakdown,
    subAdminCount,
    executiveCount
  };
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
