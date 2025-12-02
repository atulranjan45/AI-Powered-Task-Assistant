import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  summary: { type: String, default: "" },
  category: { type: String, default: "Others" },
  predictedDeadline: { type: String, default: "" },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ["low","medium","high"], default: "medium" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

taskSchema.index({ title: "text", description: "text" });

export default mongoose.model("Task", taskSchema);