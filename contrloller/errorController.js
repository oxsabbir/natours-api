const AppError = require('../utils/AppError');

const handleErrorDb = function (err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
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
    console.error('ERROR🔥', err);
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
    if (err.name === 'CastError') {
      error = handleErrorDb(err);
    }
    sendErrorProd(error, res);
  }
};
