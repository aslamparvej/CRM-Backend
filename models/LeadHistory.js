import mongoose from "mongoose";

const leadHistorySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    oldValue: {
      type: String,
    },

    newValue: {
      type: String,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("LeadHistory", leadHistorySchema);
