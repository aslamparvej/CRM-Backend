import Lead from "../models/Lead";

export const buildFilterQuery = (query, user) => {
  const { status, category, assignedTo, fromDate, toDate, search } = query;

  let filter = { isDeleted: false };

  // Role-based filter
  if (user.role == "agent") {
    filter.assignedTo = user.id;
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
