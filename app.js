const express = require('express');

const app = express();
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);

const AppError = require('./utils/AppError');

const errorController = require('./contrloller/errorController');

// 1 MIDDILEWARE
app.use(express.json());
app.use((req, res, next) => {
  req.when = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// creating a global route for error

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// it's an global error handling middleware called when anything passed on next() function on other middleware

app.use(errorController);

module.exports = app;
