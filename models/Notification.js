import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "lead-assigned",
        "lead-reassigned",
        "followup",
        "followup-reminder",
        "followup-overdue",
        "status-change",
        "note",
        "comment",
        "system",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    data: {
      leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
      },

      followUpId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FollowUp",
      },

      action: {
        type: String,
      },

      url: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Notification", notificationSchema);
