import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user._id });
    res.status(201).json(task);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: "Not found" });
    res.json(task);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

export default router;