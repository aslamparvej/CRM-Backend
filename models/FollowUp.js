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

export default mongoose.model("FollowUp", followUpSchema);
