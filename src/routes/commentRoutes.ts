/**
 * Comment Routes
 * Routes for comment operations
 */

import { Router } from 'express';
import { commentController } from '../controllers/commentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// POST routes
router.post('/api/comments', authMiddleware, commentController.createComment);
router.post('/api/comments/fetch', commentController.fetchComments);
router.post('/api/comments/:id/like', authMiddleware, commentController.likeComment);

// Other routes
router.put('/api/comments/:id/edit', authMiddleware, commentController.editComment);
router.delete('/api/comments/:id/delete', authMiddleware, commentController.deleteComment);

export default router;
