import cron from "node-cron";

import Lead from "../models/Lead.js";
import FollowUp from "../models/FollowUp.js";

import { createNotification } from "../services/notification.service.js";
import { NOTIFICATION_TYPES } from "../constants/notification.constants.js";

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Reminder (Next 15 Minutes)
    const reminderTime = new Date(now.getTime() + 15 * 60 * 1000);

    const reminders = await FollowUp.find({
      status: {
        $in: ["pending", "rescheduled"],
      },
      reminderSentAt: null,
      scheduledAt: {
        $gte: now,
        $lte: reminderTime,
      },
    }).populate("leadId");

    for (const followup of reminders) {
      await createNotification({
        user: followup.createdBy,
        type: NOTIFICATION_TYPES.FOLLOWUP_REMINDER,
        title: "Follow-up Reminder",
        message: `Follow up with ${followup.leadId.name}.`,
        data: {
          leadId: followup.leadId._id,
          followupId: followup._id,
        },
      });

      followup.reminderSentAt = new Date();
      await followup.save();
    }

    // Overdue
    const overdue = await FollowUp.find({
      status: {
        $in: ["pending", "rescheduled"],
      },
      overdueNotificationSentAt: null,
      scheduledAt: {
        $lt: now,
      },
    }).populate("leadId");

    for (const followup of overdue) {
      await createNotification({
        user: followup.createdBy,
        type: NOTIFICATION_TYPES.FOLLOWUP_OVERDUE,
        title: "Follow-up Overdue",
        message: `${followup.leadId.name} follow-up is overdue.`,
        data: {
          leadId: followup.leadId._id,
          followupId: followup._id,
        },
      });

      followup.overdueNotificationSentAt = new Date();
      await followup.save();
    }
  } catch (error) {
    console.error("Follow-up Reminder Cron:", error);
  }
});
