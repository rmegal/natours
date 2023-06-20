const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const createSigninTokenAndSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // don't send password in response
  const tempUser = user.toObject();
  delete tempUser.password;

  res.status(statusCode).json({
    status: "success",
    token,
    user: tempUser
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  createSigninTokenAndSendResponse(newUser, 201, res); 
});

const invalidLogin = new AppError("Email or Password is incorrect.", 401);

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and Password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(invalidLogin);
  }

  createSigninTokenAndSendResponse(user, 200, res); 
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please login to get access.", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(invalidLogin);
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("Password has been changed. Please login again.", 401)
    );
  }

  req.user = user;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user from posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User with that email was not found.", 404));
  }

  // 2. Generate random reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send token to user's email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const text = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIgnore this message if you did not forget your password`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      text
    });

    res.status(200).json({
      status: "success",
      message: "Token sent..."
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("ERROR 💥", err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based upon token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

  if (!user) {
    return next(new AppError("Token is invalid or expired.", 400));
  }

  // 2. Save new password if there is a user and the token has not expired
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3. Update changeedPasswordAt property of user
  // 4. Log in user and send JWT
  createSigninTokenAndSendResponse(user, 200, res); 
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user._id).select("+password");

  // 2) Check if currentPassword is correct
  if (!user || !(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(invalidLogin);
  }

  // 2a) Passwords must be different
  if (req.body.currentPassword === req.body.newPassword) {
    return next(new AppError("New password must be different!", 400))
  }

  // 3) Update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;

  await user.save();

  // 4) Log user in and return new token
  createSigninTokenAndSendResponse(user, 200, res); 
});
