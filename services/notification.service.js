import Notification from "../models/Notification.js";
import { NOTIFICATION_TYPES } from "../constants/notification.constants.js";

import { getIO } from "../socket/socket.js";

export const createNotification = async (notification) => {
  try {
    const createdNotification = await Notification.create(notification);
    const io = getIO();
    if (io) {
      io.to(notification.user.toString()).emit("notification:new", createdNotification);
    }

    return createdNotification;
  } catch (error) {
    console.error("Create Notification Error:", error.message);
    return null;
  }
};

export const notifyLeadAssigned = async (lead, userId) => {
  console.log("lead", lead);
  console.log("userId", userId);
  return createNotification({
    user: userId,
    type: NOTIFICATION_TYPES.LEAD_ASSIGNED,
    title: "New Lead Assigned",
    message: `${lead.name} has been assigned to you.`,
    data: {
      leadId: lead._id,
    },
  });
};
