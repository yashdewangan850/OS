import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true },
    title: { type: String, default: "" },
  },
  { timestamps: true },
);
export default mongoose.models.Event || mongoose.model("Event", schema);
