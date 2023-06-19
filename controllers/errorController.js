const AppError = require("../utils/appError");

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    requestedAt: req.requestTime,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      requestedAt: req.requestTime,
      message: err.message
    });
  } else {
    // eslint-disable-next-line no-console
    console.error("ERROR 💥", err);

    res.status(500).json({
      status: "error",
      requestedAt: req.requestTime,
      message: "Something went horribly wrong!"
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const duplicates = Object.keys(err.keyValue)
    .map((k) => `${k}: ${err.keyValue[k]}`)
    .join(", ");
  const message = `Duplicate field(s): ${duplicates}\nPlease use different value(s).`;
  return new AppError(message, 400);
};

const handleValidationFailedDB = (err) => {
  const validateErrors = Object.keys(err.errors)
    .map((k) => `${k}: ${err.errors[k]}`)
    .join("\n - ");
  const message = `Validation Error(s):\n - ${validateErrors}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () =>
  new AppError("You are not logged in. Please login.", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode ? err.statusCode : 500;
  err.status = err.status ? err.status : "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };

    if (error.kind === "ObjectId") {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error.code === 31254) {
      error = new AppError(err.message, 400);
    }

    if (
      error.errors &&
      error._message &&
      error._message.match(/.*validation failed.*/)
    ) {
      error = handleValidationFailedDB(error);
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      error = handleJsonWebTokenError();
    }

    sendErrorProd(error, req, res);
  }
};
