/**
 * Authentication Middleware
 * Checks if user is signed in and attaches user info to request
 */

import { Request, Response, NextFunction } from 'express';
import { auth } from '../db';
import { UnauthorizedError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const jwtClient = jwksClient({
  jwksUri: process.env.SUPABASE_JWKS_URI!,
  cache: true,          // Cache keys so it doesn't make a network request every single time
  rateLimit: true,
  jwksRequestsPerMinute: 10
});

const getJwtKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  jwtClient.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      return callback(err || new Error('Public key not found in JWKS'));
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

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

  if (!req.cookies?.sb_access_token) return res.redirect('/login');

  jwt.verify(req.cookies?.sb_access_token, getJwtKey, {
    audience: 'authenticated',
    algorithms: ["ES256"],
  }, (err, decoded: any) => {
      if (err || !decoded) {
        throw new UnauthorizedError('Invalid token signature');
      }
      
      req.userId = decoded.sub;
      req.user = decoded;
      next();
    }
  )
};

export const checkAuthRedirect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.cookies?.sb_access_token) return res.redirect('/login');

  jwt.verify(req.cookies?.sb_access_token, getJwtKey, {
    audience: 'authenticated',
    algorithms: ["ES256"],
  }, (err, decoded: any) => {
      if (err || !decoded) {
        return res.redirect('/login');
      }
      
      req.userId = decoded.sub;
      req.user = decoded;
      next();
    }
  )
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.cookies?.sb_access_token) return next()

  jwt.verify(req.cookies?.sb_access_token, getJwtKey, {
    audience: 'authenticated',
    algorithms: ["ES256"],
  }, (err, decoded: any) => {
      if (err || !decoded) {
        return next()
      }
      
      req.userId = decoded.sub;
      req.user = decoded;
      next();
    }
  )
}

export const guestMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.cookies?.sb_access_token) return res.redirect('/');
  next();
};
