import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    followUpDate: {
      type: Date,
      required: true,
    },

    note: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "done"],
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