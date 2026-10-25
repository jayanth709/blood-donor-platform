/**
 * Global error handler middleware.
 * Catches any error passed via next(error).
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // SQLite constraint violations
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    const field = err.message.split('UNIQUE constraint failed: ')[1]?.split('.')[1] || 'field';
    return res.status(400).json({
      success: false,
      message: `A record with this ${field} already exists.`
    });
  }

  if (err.message && err.message.includes('NOT NULL constraint failed')) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields.'
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
