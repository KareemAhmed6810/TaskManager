const catchAsync = require('./../utlis/catchAsync');
const { Task } = require('../models/taskModel');
const { Category } = require('./../models/categoryModel');
const { AppError } = require('./../utlis/appError');
const { AppFeatures } = require('./../utlis/features');
const factory = require('./factory');

exports.createTask = catchAsync(async function(req, res, next) {

  const search = await Category.findOne({
    _id: req.body.category,
    user: { $in: req.user._id }
  });

  if (!search)
    return next(new AppError('user doesnt have this categoryyy', 404));
    const task = await Task.create({
      title: req.body.title,
      type: req.body.type,
      text: req.body.text,
      listItems: req.body.listItems,
      shared: req.body.shared,

      owner: req.user._id,
      category: req.body.category
    });
  await Category.findByIdAndUpdate(req.body.category, {
    $push: { tasks: task._id }
  });

  res.status(201).json({
    status: 'success',
    data: {
      task
    }
  });
});
exports.getAllTasks = catchAsync(async function(req, res, next) {
  const nOfDocs = await Task.countDocuments();
  let tasks = Task.find({ owner: req.user._id });
  tasks = new AppFeatures(tasks, req.query, nOfDocs)
    .filter()
    .sort()
    .selectFields()
    .paginate();
  tasks = await tasks.query;
  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks
    }
  });
});
exports.getTask = factory.getOne(Task, { path: 'category', select: 'name' });
exports.updateTask = catchAsync(async function(req, res, next) {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});
exports.deleteTask = catchAsync(async function(req, res, next) {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  await Category.findByIdAndUpdate(task.category, {
    $pull: { tasks: task._id }
  });

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully'
  });
});
exports.getAllShared = catchAsync(async function(req, res, next) {
  let tasks = Task.find().populate({
    path: 'category',
    select: 'name'
  });

  const nOfDocs = await Task.countDocuments();
  tasks = new AppFeatures(tasks, req.query, nOfDocs)
    .filter()
    .sort()
    .selectFields()
    .paginate();
  tasks = await tasks.query;

  res.status(200).json({
    status: 'success',
    length: tasks.length,
    tasks
  });
});
