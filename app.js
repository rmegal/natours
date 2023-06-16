const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`, { index: ["overview.html"] }));

/**
 * My own middleware function.
 *
 * Note: Be sure to call next!
 */
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl}`
  // });

  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

/**
 * Error Handler: Express recognizes this as an
 * error handler by the callback function signature.
 */
app.use(globalErrorHandler);

module.exports = app;
