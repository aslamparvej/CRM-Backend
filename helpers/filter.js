import mongoose from "mongoose";

import User from "../models/User.js";
import Lead from "../models/Lead.js";

export const buildLeadFilter = async (user) => {
   const userId = new mongoose.Types.ObjectId(user.id);
  const match = { isDeleted: false };
 

  if (user?.role === "admin") {
    return match;
  }

  if (user?.role === "executive") {
    match.$or = [{ createdBy: userId }, { assignedTo: userId }];
  }

  if (user?.role === "sub-admin") {
    const executives = await User.find({
      role: "executive",
      createdBy: userId,
    }).select("_id");

    const executiveIds = executives.map((e) => e._id);

    match.$or = [
      { createdBy: userId },
      { assignedTo: userId },
      { createdBy: { $in: executiveIds } },
      { assignedTo: { $in: executiveIds } },
    ];

    return match;
  }

  return match;
};

export const buildFollowupFilter = async (user) => {
  const match = { status: { $ne: "completed" } };

  // Admin filter
  if (user?.role === "admin") {
    return match;
  }

  if (user?.role === "sub-admin") {
    const leads = await Lead.find({ assignedTo: req.user.id }, "_id");
    const leadIds = leads.map((lead) => lead._id);

    // Find executive those are created by the sub admin
    const executives = await User.find({
      role: "executive",
      createdBy: user.id,
    }).select("_id");
    // Get ids
    const executiveIds = executives.map((e) => e._id);

    // Find leads those are created by executives created by the sub admin
    const executiveLeads = await Lead.find({ assignedTo: executiveIds }, "_id");
    const executiveLeadsIds = leads.map((lead) => lead._id);

    match.$or = [
      { createdBy: user.id },
      { leadId: { $in: leadIds } },
      { createdBy: { $in: executiveLeadsIds } },
      { leadId: { $in: executiveLeadsIds } },
    ];

    return match;
  }

  // Executive filter
  if (user?.role === "executive") {
    const leads = await Lead.find({ assignedTo: req.user.id }, "_id");
    const leadIds = leads.map((lead) => lead._id);
    match.$or = [{ createdBy: user.id }, { leadId: { $in: leadIds } }];

    return match;
  }

  return match;
};
