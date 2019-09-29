class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // when a new object is created and a constructor function is called then that function call is not gonna appear in the stacktrace and will not polute it.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
