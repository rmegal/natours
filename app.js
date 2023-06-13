const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`, { index: ['overview.html']}));

/**
 * My own middleware function.
 * 
 * Note: Be sure to call next unless you want to short-circuit
 * things.
 */
app.use((req, res, next) => {
  console.log('Hello from the middleware - 😎');
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
