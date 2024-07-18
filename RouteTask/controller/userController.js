const { User } = require('../models/userModel');
const { AppError } = require('./../utlis/appError');
const catchAsync = require('../utlis/catchAsync');
const { Category } = require('../models/categoryModel');
const filterObj = (obj, ...allowedFields) => {
  const newobj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
};
exports.updateMe = catchAsync(async function(req, res, next) {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError(`to update password visit/updatePassword`, 400));
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ msg: 'success', updatedUser });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  console.log(user);

    await Category.updateMany(
      { user: req.user.id },
      { $pull: { user: req.user.id } }
    );
    await Task.updateMany(
      { owner: req.user.id },
      { $pull: { owner: req.user.id } }
    );
  res.status(200).json({
    status: 'success',
    msg: 'user is deleted suuccfully'
  });
});
exports.getUser = catchAsync(async function(req, res, next) {
  let user = await User.findById(req.params.id).populate('categories');
  if (!user) return next(new AppError('`USER IS NOT FOUND', 404));
  res.status(200).json({
    msg: 'USER FOUND',
    status: 'Success',
    user
  });
});
