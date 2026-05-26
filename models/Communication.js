import mongoose from "mongoose";

const communicationSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
    type: {
      type: String, // call, sms, whatsapp
      required: true,
    },

    message: {
      type: String,
    },

    status: {
      type: String, // sent, failed
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Communication", communicationSchema);
