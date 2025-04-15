function errorHandler(err, req, res, next) {
    // If the error is a standard JavaScript error, send this message
    if (err instanceof Error) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
      });
    } else {
    // Default case for non-standard errors (to handle unexpected issues)
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred!',
      });
    }
  }
  
  module.exports = errorHandler;