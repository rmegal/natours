const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Set security HTTP headers
app.use(helmet());

// Set logging in dev
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate API requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: "Too many requests from this IP. Try again later!"
});
app.use("/api", limiter);

// Body Parser: read data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price"
    ]
  })
);

// Serving static files
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

// Routes
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
