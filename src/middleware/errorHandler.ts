/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import notf_lang from "../locales";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[ERROR]', err);

  const errmsg = (type: string, notfId: number) => notf_lang(req, "errorHandler", type, notfId)

  // Initialize default error values
  let statusCode = 500;
  let errorMessage = errmsg('errorMessage', statusCode);
  let errorCode: string | undefined = 'INTERNAL_SERVER_ERROR';
  let errorTip = errmsg('errorTip', statusCode);

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errorCode = err.errorCode;
  } else if ((err as any).message && typeof (err as any).message === 'string') {
    // Handle Supabase/Database errors
    const message = (err as any).message;
    
    if (message.includes('unique violation') || message.includes('UNIQUE constraint')) {
      statusCode = 409;
      errorMessage = errmsg('errorMessage', statusCode);
      errorCode = 'DUPLICATE_RESOURCE';
      errorTip = errmsg('errorTip', statusCode);
    } else if (message.includes('Foreign key violation')) {
      statusCode = 400;
      errorMessage = errmsg('errorMessage', statusCode);
      errorCode = 'INVALID_REFERENCE';
      errorTip = errmsg('errorTip', statusCode);
    } else {
      errorMessage = process.env.NODE_ENV === 'development' ? err.message : errmsg('errorMessage', 500);
    }
  }

  // Determine if this is an API request or a page request
  const isApiRequest = req.path.startsWith('/api')

  // For page requests (HTML), render error page with EJS template
  if (!isApiRequest) {
    return res.status(statusCode).render('error', {
      errorCode: statusCode,
      customMessage: errorMessage,
      customTip: errorTip,
    });
  }

  // For API requests (JSON), send JSON response
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    errorCode: errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Wrapper for async route handlers to catch errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
