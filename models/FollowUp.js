import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    note: {
      type: String,
    },

    type: {
      type: String,
      enum: ["call", "whatsapp", "email", "visit", "sms"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "missed", "rescheduled" ],
      default: "pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

followUpSchema.index({ followUpDate: 1 });
followUpSchema.index({ status: 1 });

export default mongoose.model("FollowUp", followUpSchema);