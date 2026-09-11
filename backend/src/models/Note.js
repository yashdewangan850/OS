import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
export default mongoose.models.Note || mongoose.model("Note", schema);
