import { Task } from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const index = asyncHandler(async (req, res) => {
  const { status, priority, relatedLead } = req.query;
  const filter = { owner: req.user._id };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (relatedLead) filter.relatedLead = relatedLead;

  const tasks = await Task.find(filter)
    .sort({ status: 1, dueDate: 1, createdAt: -1 })
    .populate("relatedLead", "name company")
    .populate("relatedContact", "name company");

  res.json({ success: true, count: tasks.length, tasks });
});

export const store = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) throw new ApiError(400, "Title is required.");

  const task = await Task.create({ owner: req.user._id, ...req.body });
  res.status(201).json({ success: true, task });
});

export const update = asyncHandler(async (req, res) => {
  const { owner, ...updates } = req.body;

  if (updates.status === "Completed" && !updates.completedAt) {
    updates.completedAt = new Date();
  }
  if (updates.status && updates.status !== "Completed") {
    updates.completedAt = null;
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true },
  );
  if (!task) throw new ApiError(404, "Task not found with the provided id.");

  res.json({ success: true, task });
});

export const destroy = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!task) throw new ApiError(404, "Task not found with the provided id.");

  res.json({ success: true, message: "Task successfully destroyed" });
});
