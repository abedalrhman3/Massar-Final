const errorHandler = (err, req, res, next) => {
  // Mongoose validation error → always 400
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose duplicate key error → 400
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error: ' + JSON.stringify(err.keyValue),
    });
  }

  // Mongoose bad ObjectId → 400
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;