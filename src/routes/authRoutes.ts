/**
 * Auth Routes
 * Routes for authentication operations
 */

import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware, guestMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET routes
router.get('/login', guestMiddleware, authController.renderLoginPage);
router.get('/register', guestMiddleware, authController.renderRegisterPage);
router.get('/auth/:reqtype', authController.renderAuthPage);

// POST routes - Register
router.post('/api/register/email', guestMiddleware, authController.registerWithEmail);
router.post('/api/register/google', guestMiddleware, authController.registerWithGoogle);

// POST routes - Login
router.post('/api/login/email', authController.loginWithEmail);
router.post('/api/login/google', authController.loginWithGoogle);

// POST routes - Logout & Callbacks
router.post('/api/auth/google/callback', authController.googleCallback);
router.post('/api/logout', authController.logout);

// POST routes - Verification
router.post('/api/auth/validate/password', authMiddleware, authController.validatePassword);
router.post('/api/auth/verify', authController.verify)

// PUT route - Update ...
router.put('/api/auth/update/password', authMiddleware, authController.updatePassword);

// POST & PUT route - Reset ...
router.post('/api/auth/reset/password', authController.sendResetPasswordEmail);
router.put('/api/auth/reset/password', authController.resetPassword);

// DELETE (Dangerous)
router.delete('/api/auth/delete/account', authMiddleware, authController.deleteAccount);

export default router;
