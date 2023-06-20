const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // execute query
  const users = await features.query;

  // send response
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    requestedAt: req.requestTime,
    message: "getUser  is not yet implemented"
  });
};

exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    requestedAt: req.requestTime,
    message: "createUser is not yet implemented"
  });
};

exports.updateUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    requestedAt: req.requestTime,
    message: "updateUser is not yet implemented"
  });
};

exports.deleteUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    requestedAt: req.requestTime,
    message: "deleteUser is not yet implemented"
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Can't update password here. Use /updateMyPassword instead!",
        400
      )
    );
  }

  const filteredObj = filterObj(req.body, "name", "email");

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredObj, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "success",
    user: updatedUser
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false});

  res.status(204).json({
    status: "success",
    data: null
  })
});