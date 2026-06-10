/**
 * Page Controller
 * Handles static page rendering
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { STATIC_CONTENT } from '../utils/constants';
export const pageController = {
  /**
   * GET /about - Render about page
   */
  renderAboutPage: asyncHandler(async (req: Request, res: Response) => {
    res.render('others/about', { aboutContent: STATIC_CONTENT.ABOUT });
  }),

  /**
   * GET /contact - Render contact page
   */
  renderContactPage: asyncHandler(async (req: Request, res: Response) => {
    res.render('others/contact', { contactContent: STATIC_CONTENT.CONTACT });
  }),

  renderMediaAttributionPage: asyncHandler(async (req: Request, res: Response) => {
    res.render('others/media-attribution');
  })
};
