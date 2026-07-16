import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    module: {
      type: String,
      enum: ["Lead", "User", "FollowUp", "Note", "Notification", "Auth", "Communication"],
      required: true,
      index: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    targetName: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "android",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
activitySchema.index({ createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ module: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);