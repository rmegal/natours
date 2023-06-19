/**
 * catch(next) is equivalent to catch(err => next(err))
 * 
 * Passing the error (i.e., err parameter) to the next
 * function ensures the error is propogated to the "global"
 * error handler.
 */
const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

module.exports = catchAsync;
