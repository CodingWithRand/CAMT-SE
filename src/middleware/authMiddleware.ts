/**
 * Authentication Middleware
 * Checks if user is signed in and attaches user info to request
 */

import { Request, Response, NextFunction } from 'express';
import { auth } from '../db';
import { UnauthorizedError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signedIn = await auth.getUser();
    
    if (signedIn.data.user) {
      req.userId = signedIn.data.user.id;
      req.user = signedIn.data.user;
      next();
    } else {
      throw new UnauthorizedError();
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signedIn = await auth.getUser();
    
    if (signedIn.data.user) {
      req.userId = signedIn.data.user.id;
      req.user = signedIn.data.user;
    }
    next();
  } catch (error) {
    // Continue even if auth fails
    next();
  }
};

export const checkAuthRedirect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signedIn = await auth.getUser();
    
    if (!signedIn.data.user) {
      return res.redirect('/login');
    }
    
    req.userId = signedIn.data.user.id;
    req.user = signedIn.data.user;
    next();
  } catch (error) {
    res.redirect('/login');
  }
};

export const guestMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signedIn = await auth.getUser();
    
    if (signedIn.data.user) {
      return res.redirect('/');
    }
    next();
  } catch (error) {
    next();
  }
};
