const AppError = require('../utils/AppError');

const handleCastErrorDb = function (err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDb = function (err) {
  const message = `Duplicate field value: (${err.keyValue.name}) Please use another value`;
  return new AppError(message, 400);
};

const handleValidatorErrorDb = function (err) {
  const errorField = Object.values(err.errors).map(
    (el) => el.properties.message,
  );

  const message = `Invalid input data: ${errorField.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = function () {
  return new AppError('Invalid token! Please login agian.', 401);
};

const handleExpireToken = function () {
  return new AppError('Your token has expires! Please login again.', 401);
};

const sendErrorDev = function (err, res) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = function (err, res) {
  // is operational error that we trust
  if (err.isOperational) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // error that's coming from thirdParty library or somewhere else that we didn't define

    // console log the error
    // console.error('ERROR🔥', err);
    // send a generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

// when we have 4 arguments inside of an middleware that mean this is an error handling middleware
module.exports = (err, req, res, next) => {
  // sending error while devlopment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  // sending error while production
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDb(error);
    if (err.code === 11000) error = handleDuplicateErrorDb(error);
    if (err.name === 'ValidationError') error = handleValidatorErrorDb(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleExpireToken();

    // after all statement checked
    sendErrorProd(error, res);
  }
};
