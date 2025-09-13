const multer = require('multer');

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handler
const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = error.message;

  // Mongoose bad ObjectId
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(val => val.message).join(', ');
  }

  // Multer errors
  if (error instanceof multer.MulterError) {
    statusCode = 400;
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 10MB.';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded.';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected field in file upload.';
    } else {
      message = 'File upload error.';
    }
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? error.stack : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};
