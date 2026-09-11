import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, default: "" },
    type: { type: String, default: "file" },
    location: { type: String, default: "Home" },
    size: { type: Number, default: 0 },
    mimeType: String,
    deletedAt: Date,
    trashedAt: Date,
  },
  { timestamps: true },
);
export default mongoose.models.FileItem || mongoose.model("FileItem", schema);
