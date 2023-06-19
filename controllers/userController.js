const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

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
    message: "This routes is not yet implemented"
  });
};

exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    requestedAt: req.requestTime,
    message: "This routes is not yet implemented"
  });
};

exports.updateUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    requestedAt: req.requestTime,
    message: "This routes is not yet implemented"
  });
};

exports.deleteUser = (req, res, next) => {
  res.status(500).json({
    status: "error",
    requestedAt: req.requestTime,
    message: "This routes is not yet implemented"
  });
};
