const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next); // catch(next) is equivalent to catch(err => next(err))
};

module.exports = catchAsync;
