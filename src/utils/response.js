/**
 * Standard API response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata
 */
const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Success response
 */
const success = (res, message, data = null, meta = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data, meta);
};

/**
 * Error response
 */
const error = (res, message, statusCode = 500, data = null) => {
  return sendResponse(res, statusCode, false, message, data);
};

/**
 * Validation error response
 */
const validationError = (res, message, errors = null) => {
  return sendResponse(res, 400, false, message, null, { errors });
};

/**
 * Not found response
 */
const notFound = (res, message = 'Resource not found') => {
  return sendResponse(res, 404, false, message);
};

/**
 * Unauthorized response
 */
const unauthorized = (res, message = 'Unauthorized access') => {
  return sendResponse(res, 401, false, message);
};

/**
 * Forbidden response
 */
const forbidden = (res, message = 'Access forbidden') => {
  return sendResponse(res, 403, false, message);
};

/**
 * Created response
 */
const created = (res, message, data = null) => {
  return sendResponse(res, 201, true, message, data);
};

/**
 * No content response
 */
const noContent = (res, message = 'No content') => {
  return sendResponse(res, 204, true, message);
};

module.exports = {
  sendResponse,
  success,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  created,
  noContent
};
