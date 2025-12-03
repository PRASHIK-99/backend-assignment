const Task = require("../models/Task");

// @desc    Get all tasks
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  const filter =
    req.user.role === "admin" && req.query.all === "true"
      ? {}
      : { user: req.user._id };

  const tasks = await Task.find(filter);
  res.json(tasks);
};

// @desc    Create new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  // NOTE: Validation handled by middleware

  const task = await Task.create({
    user: req.user._id,
    ...req.body,
  });

  res.status(201).json(task);
};

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ message: "Task not found" });

  // Ensure user owns task or is admin
  if (
    task.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedTask);
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ message: "Task not found" });

  if (
    task.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await task.deleteOne();
  res.json({ message: "Task removed" });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
