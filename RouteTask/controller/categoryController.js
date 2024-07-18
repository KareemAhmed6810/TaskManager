const catchAsync = require('./../utlis/catchAsync');
const { Category } = require('./../models/categoryModel');
const { User } = require('./../models/userModel');
const { AppError } = require('./../utlis/appError');
const { AppFeatures } = require('./../utlis/features');
const factory = require('./factory');

exports.getAllCategories = catchAsync(async function(req, res, next) {
    const nOfDocs = await Category.countDocuments();
    let tasks = Category.find({ user: req.user._id });
    tasks = new AppFeatures(tasks, req.query, nOfDocs)
      .filter()
      .sort()
      .selectFields()
      .paginate();
    tasks = await tasks.query;
  res.status(200).json({
    msg: 'success',
    length:tasks.length,
    tasks
  });
});
exports.createCategory = catchAsync(async function(req, res, next) {
  const catg = await Category.create({
    name: req.body.name,
    user: req.user._id
  });
  await User.findByIdAndUpdate(req.user._id, {
    $push: { categories: catg._id }
  });
  res.status(200).json({
    msg: 'success',
    catg
  });
});
exports.getCategory = factory.getOne(Category, {path:'user',select: 'name'});

exports.updateCategory = catchAsync(async function(req, res, next) {
  let user = await Category.findOneAndUpdate(
    { user: req.user._id, _id: req.params.id },
    {
      name: req.body.name,
      taks: req.body.tasks
    },
    { new: true, runValidators: true }
  );
  if (!user) return next(new AppError('USER IS NOT FOUND', 404));
  res.status(200).json({
    status: 'Success',
    user
  });
});
exports.deleteCategory = catchAsync(async function(req, res, next) {
  let user = await Category.findOneAndDelete(
    { user: req.user._id, _id: req.params.id },
    {
      name: req.body.name,
      taks: req.body.tasks
    }  );
  if (!user) return next(new AppError('USER IS NOT FOUND', 404));
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { categories: req.params.id }
  });
  res.status(200).json({
    status: 'Success'
  });
});
