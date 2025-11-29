import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Central error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.id || Math.random().toString(36).substr(2, 9);

  const logEntry = {
    timestamp,
    requestId,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    error: err.message,
    stack: err.stack
  };

  try {
    fs.appendFileSync(
      path.join(logsDir, 'errors.log'),
      JSON.stringify(logEntry) + '\n'
    );
  } catch (e) {
    console.error('Failed to write to error log:', e);
  }

  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = isDevelopment ? err.message : 'Internal server error';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    requestId: requestId,
    timestamp: timestamp,
    ...(isDevelopment && { details: err.stack })
  });
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method
  });
};

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
