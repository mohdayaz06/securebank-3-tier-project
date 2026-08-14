/**
 * Handles requests to routes that don't exist.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central error handler (4-arg signature is required for Express to
 * recognize it as such). Normalizes MySQL and application errors into a
 * consistent JSON shape for the frontend.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // MySQL duplicate entry (e.g. duplicate email / account number)
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with these details already exists';
  }

  // MySQL foreign key constraint failures
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 409;
    message = 'This operation violates a data relationship constraint';
  }

  // Never leak internal MySQL/driver error details to the client
  if (err.sqlMessage && statusCode === 500) {
    message = 'A database error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
