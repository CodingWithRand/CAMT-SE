/**
 * User Routes
 * Routes for user operations (including auth)
 */

import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware, checkAuthRedirect } from '../middleware/authMiddleware';

const router = Router();

// GET routes
router.get('/account', checkAuthRedirect, userController.renderAccountPage);
router.get('/account/preferences', checkAuthRedirect, userController.renderPreferencesPage);
router.get('/api/users/fetch/current/preferences', authMiddleware, userController.getCurrentUserPreferences);
router.get('/api/users/fetch/current/saved_blogs', authMiddleware, userController.getCurrentUserSavedBlogIds);
router.get('/api/users/fetch/current/:property', authMiddleware, userController.fetchCurrentUserProperty);

// POST routes
router.post('/api/users/fetch', authMiddleware, userController.fetchUserProfile);

// Other routes
router.put('/api/users/update', authMiddleware, userController.updateUserProfile)
router.put('/api/users/update/current/preferences', authMiddleware, userController.updateCurrentUserPreferences);

export default router;
