/**
 * User Controller
 * Handles user related operations
 */

import { Request, Response } from 'express';
import { auth } from '../db';
import { UserModel } from '../models/userModel';
import { BlogModel } from '../models/blogModel';
import { asyncHandler } from '../middleware/errorHandler';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { validateBio } from '../utils/validators';
import { ValidationError } from '../utils/errors'
import { CommentModel } from '../models/commentModel';
import notf_lang from "../locales"

const t = (req: Request, c: string, fn?: number | string) => notf_lang(req, 'user', c, fn)

export const userController = {
  /**
   * GET /account - Render account page
   */
  renderAccountPage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.redirect('/login');

    const userProfile = await UserModel.getProfileByUserId(req.userId!);
    res.render('user_pages/settings/account', { user: userProfile });
  }),

  /**
   * GET /account/preferences - Render preferences page
   */
  renderPreferencesPage: asyncHandler(async (req: Request, res: Response) => {;
    if (!req.user) return res.redirect('/login');
    
    const userPreferences = await UserModel.getUserPreferences(req.userId!);
    res.render('user_pages/settings/preferences', { preferences: userPreferences });
  }),

  /**
   * GET /api/users/fetch/current/:property - Fetch current user property
   */
  fetchCurrentUserProperty: asyncHandler(async (req: Request, res: Response) => {
    // console.log(req)
    console.log(req.user, req.userId)
    if (!req.userId) throw new UnauthorizedError();

    const { property } = req.params;

    if (!property || typeof property !== 'string') {
      throw new Error(t(req, "fetchCurrentUserProperty", 1));
    }

    const userProperty = await UserModel.getProfileProperty(req.userId, property);

    res.status(200).json({ user: userProperty });
  }),

  /**
   * POST /api/users/fetch - Fetch user profile
   */
  fetchUserProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    const { uid } = req.body;

    if (!uid) {
      throw new Error(t(req, "fetchUserProfile", 1));
    }

    const userProfile = await UserModel.getProfileByUserId(uid);

    res.status(200).json({ profile: userProfile });
  }),

  /**
   * PUT /api/users/update - Update user profile
   */
  updateUserProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();
    
    const { avatar, displayName, bio } = req.body;

    if(!validateBio(bio)) throw new ValidationError(t(req, "updateUserProfile", 1));

    await UserModel.updateProfile(req.local_supabase!, req.userId, { avatar, display_name: displayName, bio})
    
    res.status(200).send();
  }),

  /**
   * GET /people/:username - View public profile
   */
  viewPublicProfile: asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    
    if (!username || typeof username !== 'string') {
      throw new Error(t(req, "viewPublicProfile", 1));
    }
    
    let profile;
    let blogs = [];
    let commentCounts;
    let postCount;
    try {
      // Get profile by username
      profile = await UserModel.getProfileByUsername(req.local_supabase!, username);
      
      // Get user's blogs (filter by visibility)
      blogs = await BlogModel.getBlogsByAuthor(profile[0].uid, req.userId);
      
      // Get comment counts for each blog
      commentCounts = await Promise.all(
        blogs.map((blog: any) => CommentModel.getCommentCount(blog.blogid))
      );

      postCount = await UserModel.getPostCount(profile[0].uid)
    } catch (error) {
      if (error instanceof NotFoundError) return res.status(404).render('error', {
        errorCode: 404,
        customMessage: t(req, "viewPublicProfile", 2),
        customTip: t(req, "viewPublicProfile", 3) 
      })
    }

    // Get stats (placeholder values - you can add RPC functions for these later)
    const stats = {
      postCount, // TODO: RPC function to get post count.
      followerCount: 0, // TODO: Implement followers system (After MVP)
      followingCount: 0 // TODO: Implement following system (After MVP)
    };
    
    // Get current user if logged in
    const currentUser = req.userId ? await UserModel.getProfileByUserId(req.userId) : null;
    
    res.render('user_pages/people', {
      profile: profile![0],
      blogs,
      commentCounts,
      stats,
      currentUser,
      user: currentUser // For header navigation
    });
  }),

  /**
   * GET /api/users/fetch/current/preferences - Get current user preferences
   */
  getCurrentUserPreferences: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    const userPreferences = await UserModel.getUserPreferences(req.userId);
    res.status(200).json({ preferences: userPreferences });
  }),


  /**
   * PUT /api/users/update/current/preferences - Update current user preferences
   */
  updateCurrentUserPreferences: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    await UserModel.updateUserPreferences(req.local_supabase!, req.userId, req.body);

    res.status(200).send();
  })
}
