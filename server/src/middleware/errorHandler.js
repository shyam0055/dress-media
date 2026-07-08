/**
 * Global error handler — catches all errors passed via next(err)
 * Returns consistent JSON error responses.
 */
export const errorHandler = (err, req, res, _next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  // Firebase Admin errors
  if (typeof err.code === 'string' && err.code.startsWith('auth/')) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }

  // Validation errors (express-validator)
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  // CORS errors
  if (err.message?.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Cross-origin request blocked.',
    });
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : err.message,
  });
};

/**
 * Helper to create structured error objects
 */
export const createError = (message, statusCode = 500) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};
