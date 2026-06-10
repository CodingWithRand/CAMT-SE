/**
 * Upload Routes
 * Routes for file upload operations
 */

import { Router } from 'express';
import multer from 'multer';
import { storageController } from '../controllers/storageController';
import { authMiddleware } from '../middleware/authMiddleware';
import { UPLOAD } from '../utils/constants';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: UPLOAD.MAX_FILE_SIZE },
  storage: multer.memoryStorage(),
});

// POST routes
router.post('/api/blogs/upload/image', authMiddleware, upload.single('image'), storageController.uploadImagesForBlog);
router.post('/api/users/upload/avatar', authMiddleware, upload.single('avatar'), storageController.uploadPFP)

export default router;
