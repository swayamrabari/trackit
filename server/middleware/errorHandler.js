const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error('Request error', {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
    ip: req.ip,
  });

  const userMessage = statusCode === 429
    ? err.message
    : err.statusCode && err.statusCode < 500
      ? err.message
      : 'Something went wrong. Please try again.';

  res.status(statusCode).json({ message: userMessage });
};

module.exports = errorHandler;