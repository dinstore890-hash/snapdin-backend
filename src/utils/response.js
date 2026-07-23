/**
 * Send a standardised success response.
 * @param {import('express').Response} res
 * @param {object} data  - Additional fields merged into the response body.
 * @param {number} [statusCode=200]
 */
const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, ...data });
};

/**
 * Send a standardised error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 */
const errorResponse = (res, message, statusCode = 500) => {
  res.status(statusCode).json({ success: false, message });
};

module.exports = { successResponse, errorResponse };
