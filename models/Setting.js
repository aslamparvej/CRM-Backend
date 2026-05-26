import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  allowDeleteLeads: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Setting", settingSchema);