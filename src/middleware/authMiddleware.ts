/**
 * Authentication Middleware
 * Checks if user is signed in and attaches user info to request
 */

import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { UnauthorizedError } from '../utils/errors';
import { asyncHandler } from './errorHandler';
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
      local_supabase?: SupabaseClient<any, "public", "public", any, any>
    }
  }
}

export const authMiddleware = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  // console.log(req.cookies?.sb_access_token)
  if (!req.cookies?.sb_access_token) throw new UnauthorizedError('Invalid token signature');

  // jwt.verify and below run parallely -> synchronize it.

  jwt.verify(req.cookies?.sb_access_token, getJwtKey, {
    audience: 'authenticated',
    algorithms: ["ES256"],
  }, (err, decoded: any) => {
      if (err || !decoded) {
        return console.error(err);
      }
      
      req.userId = decoded.sub;
      req.user = decoded;
      req.local_supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: { persistSession: false },
          global: {
            headers: {
              Authorization: `Bearer ${req.cookies?.sb_access_token}`
            }
          }
        }
      );
      next();
  })
});

export const checkAuthRedirect = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.cookies?.sb_access_token) return res.redirect('/login');

  jwt.verify(req.cookies?.sb_access_token, getJwtKey, {
    audience: 'authenticated',
    algorithms: ["ES256"],
  }, async (err, decoded: any) => {
      if (err || !decoded) {
        return res.redirect('/login');
      }
      
      req.userId = decoded.sub;
      req.user = decoded;
      req.local_supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: { persistSession: false },
          global: {
            headers: {
              Authorization: `Bearer ${req.cookies?.sb_access_token}`
            }
          }
        }
      );

      next();
    }
  )
});

export const optionalAuthMiddleware = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.cookies?.sb_access_token) return next()

  jwt.verify(req.cookies?.sb_access_token, getJwtKey, {
    audience: 'authenticated',
    algorithms: ["ES256"],
  }, async (err, decoded: any) => {
      if (err || !decoded) {
        return next()
      }
      
      req.userId = decoded.sub;
      req.user = decoded;
      req.local_supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: { persistSession: false },
          global: {
            headers: {
              Authorization: `Bearer ${req.cookies?.sb_access_token}`
            }
          }
        }
      );

      next();
    }
  )
});

export const guestMiddleware = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.cookies?.sb_access_token) return res.redirect('/');
  next();
});
