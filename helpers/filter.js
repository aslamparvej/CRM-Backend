import User from "../models/User.js";

export const buildLeadFilter = async (user) => {
  const match = { isDeleted: false };

  if (user?.role === "admin") {
    return match;
  }

  if (user?.role === "executive") {
    match.$or = [{ createdBy: user.id }, { assignedTo: user.id }];
  }

  if (user?.role === "sub-admin") {
    const executives = await User.find({
      role: "executive",
      createdBy: user.id,
    }).select("_id");

    const executiveIds = executives.map((e) => e._id);

    match.$or = [
        {createdBy: user.id},
        {assignedTo: user.id},
        {createdBy: {$in: executiveIds}},
        {assignedTo: {$in: executiveIds}},
    ];

    return match;
  }

  return match;
};
