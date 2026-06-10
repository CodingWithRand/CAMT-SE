/**
 * Blog Routes
 * Routes for blog operations
 */

import { Router } from 'express';
import { blogController } from '../controllers/blogController';
import { authMiddleware, optionalAuthMiddleware, checkAuthRedirect } from '../middleware/authMiddleware';

const router = Router();

// GET routes
router.get('/', optionalAuthMiddleware, blogController.renderHomePage);
router.get('/blogs/saves', checkAuthRedirect, blogController.renderSavedBlogsPage);
router.get('/blogs/:blogid/edit', checkAuthRedirect, blogController.renderEditPage)
router.get('/blogs/:blogid/*splat', optionalAuthMiddleware, blogController.viewBlog);
router.get('/blogs/:blogid', optionalAuthMiddleware, blogController.viewBlog);
router.get('/compose', checkAuthRedirect, blogController.renderComposePage);

// POST routes
router.post('/api/compose', authMiddleware, blogController.composeBlog);
router.post('/api/blogs/:id/like', authMiddleware, blogController.likeBlog);
router.post('/api/blogs/:id/save', authMiddleware, blogController.saveBlog);
router.post('/api/blogs/fetch/from/my-saves', optionalAuthMiddleware, blogController.fetchBlogs);
router.post('/api/blogs/fetch/from/:uid', optionalAuthMiddleware, blogController.fetchBlogs);
router.post('/api/blogs/fetch', optionalAuthMiddleware, blogController.fetchBlogs);

// Other routes
router.put('/api/compose', authMiddleware, blogController.composeBlog);
router.delete('/api/blogs/:id/delete', authMiddleware, blogController.deleteBlog);

export default router;
