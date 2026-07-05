import mongoose, { Types } from "mongoose";

const leadStatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    color: { type: String, default: "#3B82F6" },

    order: {
      type: Number,
      default: 0,
    },

    isClosed: {
      type: Boolean,
      default: false,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("LeadStatus", leadStatusSchema);
