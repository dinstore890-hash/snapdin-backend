const logger = require('../utils/logger');

// Four-argument signature is required by Express to recognise this as an error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log the top-level message and the root cause (if wrapped by the service layer)
  logger.error(err.message);
  if (err.cause) logger.error(`Caused by: ${err.cause.message}`);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
