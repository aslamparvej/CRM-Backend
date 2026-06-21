import User from "../models/User.js";

export const buildFilterQuery = async (query, user) => {
  const { status, category, assignedTo, fromDate, toDate, search } = query;

  let filter = { isDeleted: false };

  // Role-based filter
  if (user?.role === "executive") {
    filter.$or = [{ createdBy: user.id }, { assignedTo: user.id }];
  }

  if (user?.role === "sub-admin") {
    const executives = await User.find({
      role: "executive",
      createdBy: user.id,
    }).select("_id");

    const executiveIds = executives.map((e) => e._id);

    filter.$or = [
      { createdBy: user.id },
      { assignedTo: user.id },
      { createdBy: { $in: executiveIds } },
      { assignedTo: { $in: executiveIds } },
    ];
  }

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (assignedTo) filter.assignedTo = assignedTo;

  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search } },
    ];
  }

  return filter;
};
