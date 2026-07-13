import { createActivity } from "../services/activity.service.js";

export const logActivity = async ({
  req,
  module,
  action,
  targetId = null,
  targetName = "",
  description = "",
  metadata = {},
}) => {
  try {
    await createActivity({
      user: req.user.id,
      module,
      action,
      targetId,
      targetName,
      description,
      metadata,
       ip: req.ip || "",
      platform: req.platform || "android",
    });
  } catch (error) {
    console.error("Failed to log activity", error);
  }
};
