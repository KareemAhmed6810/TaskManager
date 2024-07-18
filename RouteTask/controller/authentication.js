const { AppError } = require('./../utlis/appError');
const { User } = require('./../models/userModel');
const catchAsync = require('../utlis/catchAsync');
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utlis/email');
function createToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  return token;
}

exports.signUp = catchAsync(async function(req, res) {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  const token = createToken(user._id);
  user.password = undefined;
  res.status(200).json({
    msg: 'User is created succfully',
    user,
    token
  });
});
exports.login = catchAsync(async function(req, res, next) {
  const { email, password } = req.body;
  let user = await User.findOne({ email }).select('+password');
  if (!user) next(new AppError('Either email or password is wrong', 401));
  let passCheck = await user.comparePasswords(password, user.password);
  if (!passCheck) next(new AppError('Either email or password is wrong', 401));

  const token = createToken(user._id);
  res.status(200).json({
    status: 'success',
    msg: 'Welcome',
    token
  });
});
exports.protection = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    if (req.headers.authorization.startsWith('Bearer'))
      token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  let user = await User.findById(decoded.id);
  if (!user) return next(new AppError('The user no longer exists', 401));
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'user recently has changed the password please login again',
        401
      )
    );
  }
  req.user = user;
  next();
});
exports.forgetPassword = catchAsync(async function(req, res, next) {
  let { email } = req.body;
  let user = await User.findOne({ email });
  if (!user) return next(new AppError(`user is not found`, 404));
  let token = user.createPasswordToken();
  
  await user.save({ validateBeforeSave: false });
  const url = `${req.protocol}://${req.get(
    'host'
  )}/users/resetPassword/${token}`;

  const msg = `add password and passwordConfirm to url \n${url}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'change password valid for 10 min',
      msg
    });
    res.status(200).json({
      status: 'success',
      msg: 'token is send to u in email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('ERROR SENDING IN EMAIL', 500));
  }
});

exports.resetPassword = catchAsync(async function(req, res, next) {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user)
    return next(new AppError(`Token is either invalod or expired`, 400));
      console.log(req.params.token);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  console.log("DONEEEEEEEE")
  const token = createToken(user._id);
  res.status(200).json({
    msg:'Welcome back',
    token
  })
});
exports.updatePassword = catchAsync(async function(req, res, next) {
  const user = await User.findById(req.user._id).select('+password');
  const correctPassword = await user.comparePasswords(
    req.body.passwordCurrent,
    user.password
  );
  if (!user || !correctPassword)
    next(new AppError(`ur current password is wrong`, 401));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  const token = createToken(user._id);
  res.status(200).json({
    msg: 'password is updated succufully',
    token
  });
});
