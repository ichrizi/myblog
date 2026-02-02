const logger = require('../utils/logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async wrapper to catch errors
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Duplicate key error (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    err.statusCode = 400;
  }

  // Invalid token
  if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token';
    err.statusCode = 401;
  }

  // Token expired
  if (err.name === 'TokenExpiredError') {
    err.message = 'Token expired';
    err.statusCode = 401;
  }

  // Cast error (Invalid MongoDB ID)
  if (err.name === 'CastError') {
    err.message = 'Invalid resource ID';
    err.statusCode = 400;
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors)
      .map((e) => e.message);
    err.message = errors.join(', ');
    err.statusCode = 400;
  }

  logger.error(`[${req.method} ${req.path}] ${err.message}`, err, {
    statusCode: err.statusCode,
    userId: req.user?.id,
    ip: req.ip,
  });

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    statusCode: err.statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { AppError, catchAsync, errorHandler };
