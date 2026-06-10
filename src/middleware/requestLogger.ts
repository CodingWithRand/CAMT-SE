/**
 * Request Logging Middleware
 * Logs incoming requests for debugging and monitoring
 */

import { Request, Response, NextFunction } from 'express';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, path, query, body, userId } = req;
    
    console.log(
      `[${new Date().toISOString()}] ${method} ${path} - Status: ${res.statusCode} - Duration: ${duration}ms` +
      (userId ? ` - User: ${userId}` : '')
    );
  });

  next();
};
