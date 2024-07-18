const {AppError} = require('./../utlis/appError');


const handleWebTokenError = () => {
  return new AppError('Invalid token, please log in again', 401);
};

const handleTokenExpiredError = () => {
  return new AppError('Your token has expired, please log in again', 401);
};

const handleCastErrorDB = err => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.name;
  return new AppError(
    `Duplicate field value: "${value}". Please use another value!`,
    400
  );
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
};

function globalErrorHandling(err, req, res, next) {
  console.log('HELLO FROM GLOBAL ERROR HANDLING');
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV === 'development') {
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleWebTokenError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack
    });
  } 
  else if (process.env.NODE_ENV === 'production') {
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleWebTokenError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  }
}
module.exports={globalErrorHandling}