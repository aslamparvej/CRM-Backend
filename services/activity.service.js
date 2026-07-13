import Activity from "../models/Activity.js";

export const createActivity = async ({
  user,
  module,
  action,
  targetId,
  targetName,
  description,
  metadata,
  ip,
  platform,
}) => {
  try {
    return await Activity.create({
      user,
      module,
      action,
      targetId,
      targetName,
      description,
      metadata,
      ip,
      platform,
    });
  } catch (error) {
    console.error(error);
  }
};
