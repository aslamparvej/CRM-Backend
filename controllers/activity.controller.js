import Activity from "../models/Activity.js";
import User from "../models/User.js";

export const getActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      module,
      action,
      userId,
      search,
      period = "all",
      from,
      to,
    } = req.query;

    const query = {};

    // Role based filtering
    if (req.user.role === "executive") {
      query.user = req.user._id;
    } else if (req.user.role === "sub-admin") {
      // Get all users created by this sub-admin
      const users = await User.find({
        createdBy: req.user._id,
      }).select("_id");
      const userIds = users.map((u) => u._id);

      // Include sub-admin's own activities
      userIds.push(req.user._id);
      query.user = { $in: userIds };

      // If filtering by a specific user
      if (userId) {
        if (!userIds.some((id) => id.toString() === userId)) {
          return res.status(403).json({
            success: false,
            message: "You are not allowed to view this user's activities.",
          });
        }

        query.user = userId;
      }
    } else if (req.user.role === "admin") {
      // Admin can filter any user
      if (userId) {
        query.user = userId;
      }
    }

    if (module) query.module = module;
    if (action) query.action = action;

    // Search
    if (search) {
      query.$or = [
        { targetName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Date filters
    const now = new Date();

    switch (period) {
      case "today": {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        query.createdAt = {
          $gte: start,
          $lte: end,
        };
        break;
      }

      case "week": {
        const start = new Date();
        start.setDate(now.getDate() - 7);

        query.createdAt = {
          $gte: start,
        };
        break;
      }

      case "month": {
        const start = new Date();
        start.setMonth(now.getMonth() - 1);

        query.createdAt = {
          $gte: start,
        };
        break;
      }

      case "custom": {
        if (from && to) {
          query.createdAt = {
            $gte: new Date(from),
            $lte: new Date(to),
          };
        }
        break;
      }

      default:
        break;
    }

    const activities = await Activity.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Activity.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Activities fetched successfully.",
      data: activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Activities:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch activities.",
    });
  }
};
