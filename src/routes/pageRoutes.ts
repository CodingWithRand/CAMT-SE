/**
 * Page Routes
 * Routes for static page rendering
 */

import { Router } from 'express';
import { pageController } from '../controllers/pageController';
import { optionalAuthMiddleware } from '../middleware/authMiddleware';
import { userController } from '../controllers/userController';

const router = Router();

// GET routes
router.get('/about', pageController.renderAboutPage);
router.get('/contact', pageController.renderContactPage);
router.get('/people/@:username', optionalAuthMiddleware, userController.viewPublicProfile);
router.get('/people/:username', optionalAuthMiddleware, userController.viewPublicProfile);
router.get('/media', pageController.renderMediaAttributionPage);

// POST routes
router.post('/api/contact/send', pageController.sendContact);

export default router;
