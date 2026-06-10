/**
 * Upload Controller
 * Handles file upload operations
 */

import { Request, Response } from 'express';
import { auth, supabase } from '../db';
import crypto from 'crypto';
import path from 'path';
import { asyncHandler } from '../middleware/errorHandler';
import { UnauthorizedError, ValidationError, DatabaseError } from '../utils/errors';
import { UPLOAD } from '../utils/constants';

export const storageController = {
  /**
   * POST /api/blogs/upload/image - Upload image to storage
   */
  uploadImagesForBlog: asyncHandler(async (req: Request, res: Response) => {
    const signedIn = await auth.getUser();
    if (!signedIn.data.user) throw new UnauthorizedError('Unauthorized user trying to upload an image');

    // Check if file exists
    if (!req.file) {
      throw new ValidationError('No file provided or key mismatch');
    }

    // Check blog ID
    const { blogid } = req.body;
    if (!blogid) {
      throw new ValidationError('Blog ID is required');
    }

    // Get current session for authorization
    const userSession = await auth.getSession();
    if (!userSession.data.session?.access_token) {
      throw new UnauthorizedError('No active session');
    }

    // Generate file hash and path
    const filehash = crypto
      .createHash('md5')
      .update(req.file.buffer)
      .digest('hex');
    const ext = path.extname(req.file.originalname || `${Date.now().toString()}.png`);
    const fileName = `/${parseInt(blogid)}/${filehash}${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(UPLOAD.STORAGE_BUCKETS.BLOG)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
        headers: {
          Authorization: `Bearer ${userSession.data.session.access_token}`,
        },
      });

    if (error) {
      throw new DatabaseError(error.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(UPLOAD.STORAGE_BUCKETS.BLOG)
      .getPublicUrl(data.path);

    res.status(200).json({ url: publicUrl });
  }),

  /**
   * POST /api/users/upload/image - Upload user pfp image to storage
   */
  uploadPFP: asyncHandler(async (req: Request, res: Response) => {
    const signedIn = await auth.getUser();
    if (!signedIn.data.user) throw new UnauthorizedError('Unauthorized user trying to upload an image');

    // Check if file exists
    if (!req.file) {
      throw new ValidationError('No file provided or key mismatch');
    }

    // Get current session for authorization
    const userSession = await auth.getSession();
    if (!userSession.data.session?.access_token) {
      throw new UnauthorizedError('No active session');
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(UPLOAD.STORAGE_BUCKETS.USER_AVATAR)
      .upload(`/${signedIn.data.user.id}.png`, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
        headers: {
          Authorization: `Bearer ${userSession.data.session.access_token}`,
        },
      });

    if (error) {
      throw new DatabaseError(error.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(UPLOAD.STORAGE_BUCKETS.USER_AVATAR)
      .getPublicUrl(data.path);

    res.status(200).json({ url: publicUrl });
  }),

  /**
   * DELETE /api/blogs/:id/delete - Delete a blog. This extension delete all images used in the blog.
   */

  deleteBlogImages: async (blogId: number) => {
    // 1. List all files in the folder
    const { data: files, error: listError } = await supabase.storage
      .from(UPLOAD.STORAGE_BUCKETS.BLOG)
      .list(blogId.toString(), {
        limit: 1000, // Supabase limit per request
      });

    if (listError) throw new DatabaseError(listError.message);
    if (!files || files.length === 0) return; // No files to delete

    // 2. Map files to their full paths
    // Note: .list() returns objects, so we need to add the folder prefix back
    const filesToRemove = files.map((x) => `${blogId.toString()}/${x.name}`);

    // 3. Delete the files
    const { data, error: deleteError } = await supabase
      .storage
      .from(UPLOAD.STORAGE_BUCKETS.BLOG)
      .remove(filesToRemove);

    if (deleteError) throw new DatabaseError(deleteError.message);
    
    return data;
  }
};
