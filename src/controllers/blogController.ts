/**
 * Blog Controller
 * Handles blog related operations
 */

import { Request, Response } from 'express';
import { auth } from '../db';
import { BlogModel } from '../models/blogModel';
import { UserModel } from '../models/userModel';
import { CommentModel } from '../models/commentModel';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBlogData } from '../utils/validators';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors';
import { PAGINATION, STATIC_CONTENT } from '../utils/constants';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { storageController } from './storageController';

export const blogController = {
  /**
   * GET / - Home page (logged in users) or Landing page (guests)
   */
  renderHomePage: asyncHandler(async (req: Request, res: Response) => {
    const signedIn = await auth.getUser();

    if (signedIn.data.user) {
      // Logged in user - show dashboard
      const userProfile = await UserModel.getProfileByUserId(signedIn.data.user.id);
      let blogs
      if(req.query.search) blogs = await BlogModel.searchBlogs(req.query.search as string, 0, PAGINATION.BLOGS_PER_PAGE);
      else blogs = await BlogModel.getAllBlogs(0, PAGINATION.BLOGS_PER_PAGE);

      const authorsProfile: any[] = [];
      const commentCounts: number[] = [];

      for (const b of blogs) {
        const commentCount = await CommentModel.getCommentCount(b.blogid);
        authorsProfile.push(b.profiles);
        commentCounts.push(commentCount);
      }

      res.render('index/home', {
        user: userProfile,
        authors: authorsProfile,
        blogs,
        commentCounts,
      });
    } else {
      // Guest user - show landing page
      const featuredPosts = await BlogModel.getFeaturedBlogs(5);
      const latestPosts = await BlogModel.getLatestBlogs(5);

      const authorsProfile: { fp: any[], lp: any[] } = { fp: [], lp: [] };
      const commentCounts: { fp: number[], lp: number[] } = { fp: [], lp: [] };

      for (const fp of featuredPosts) {
        const commentCount = await CommentModel.getCommentCount(fp.blogid);
        authorsProfile.fp.push(fp.author_profile);
        commentCounts.fp.push(commentCount);
      }

      for (const lp of latestPosts) {
        const commentCount = await CommentModel.getCommentCount(lp.blogid);
        authorsProfile.lp.push(lp.author_profile);
        commentCounts.lp.push(commentCount);
      }

      res.render('index/landing', {
        landingStartingContent: STATIC_CONTENT.LANDING,
        featuredPosts,
        latestPosts,
        commentCounts,
        authors: authorsProfile
      });
    }
  }),

  /**
   * GET /blogs/:blogid - View single blog
   */
  viewBlog: asyncHandler(async (req: Request, res: Response) => {
    let { blogid } = req.params;

    if (!blogid || isNaN(parseInt(blogid as string))) res.render('error')
    
    // Ensure blogid is a string (handle array case)
    if (Array.isArray(blogid)) blogid = blogid[0];

    // Get blog
    let blog;
    try {
      blog = await BlogModel.getBlogById(parseInt(blogid as string));
      if (blog.visibility === 0) throw new UnauthorizedError('This blog is private');
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).render('error', {
          errorCode: 404,
          customMessage: "The blog you're looking for doesn't exist or has been deleted.",
          customTip: "Please check the URL or return to the homepage.",
        });
      } else if (error instanceof UnauthorizedError) {
        return res.status(401).render('error', {
          errorCode: 401,
          customMessage: error.message,
          customTip: "This blog is private by the author. You may contact them to request access.",
        });
      }
      console.error(error)
    }

    // Convert Quill Delta to HTML
    const quillDeltaConverter = new QuillDeltaToHtmlConverter(blog?.content.ops, {
      inlineStyles: true,
    });
    const htmlContent = quillDeltaConverter.convert();

    // Get comments
    const commentCount = await CommentModel.getCommentCount(blog?.blogid);
    const comments = await CommentModel.getComments(blog?.blogid);

    // Check for replies for each comment
    for (let i = 0; i < comments.length; i++) {
      const hasReplies = await CommentModel.hasReplies(blog?.blogid, comments[i].cid);
      if (hasReplies) {
        comments[i].hasReplies = true;
      }
    }

    // Get current user if logged in
    let userProfile;
    const signedIn = await auth.getUser();
    if (signedIn.data.user) {
      userProfile = await UserModel.getProfileByUserId(signedIn.data.user.id);
    }

    const authorPreferences = await UserModel.getUserPreferences(blog.authorid);

    const displayingBlog = {
      blogid: blog.blogid,
      author: blog.profiles,
      title: blog.title,
      description: blog.description,
      content: htmlContent,
      likes: blog.likedBy?.length || 0,
      createdAt: blog.postedon,
      allowComments: blog.allow_comments,
    };

    res.render('blogs/blog', {
      blog: displayingBlog,
      pageTitle: blog.title,
      user: userProfile,
      cap: comments,
      cc: commentCount,
      ap: authorPreferences
    });
  }),

  /**
   * POST & PUT /api/compose - Create or update blog
   */
  composeBlog: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    const { blogTitle, blogDescription, content, blogid, visibility, allowComments } = req.body;

    if (req.method === 'POST') {
      // Validate blog data
      validateBlogData({ blogTitle, blogDescription });

      const result = await BlogModel.createBlog(req.userId, {
        blogTitle,
        blogDescription,
        content,
        visibility: visibility !== undefined ? visibility : 2, // Default to Public (2)
        allowComments: allowComments !== undefined ? allowComments : true // Default to allowing comments
      });

      res.status(201).json({ blogid: result.blogid });
    } else if (req.method === 'PUT') {
      if (!blogid) throw new ValidationError('Blog ID is required for update');
      validateBlogData({ blogTitle, blogDescription });

      await BlogModel.updateBlog(parseInt(blogid), { 
        title: blogTitle, 
        description: blogDescription, 
        content,
        visibility: visibility !== undefined ? visibility : undefined,
        allow_comments: allowComments !== undefined ? allowComments : undefined
      });
      res.status(200).send();
    } else {
      throw new ValidationError('Invalid request type');
    }
  }),

  /**
   * GET /compose - Render compose page
   */
  renderComposePage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) return res.redirect('/login');
    const authorPreferences = await UserModel.getUserPreferences(req.userId);
    res.render('blogs/compose', { ap: authorPreferences });
  }),

  /**
   * GET /blogs/:blogid/edit - Render edit page
   */
  renderEditPage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) return res.redirect('/login');

    if (!req.params.blogid || isNaN(parseInt(req.params.blogid as string))) return res.render('error');

    let blogData;
    try {
      blogData = await BlogModel.getBlogById(parseInt(req.params.blogid as string));
      blogController.validateBlogOwnership(blogData, req.userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).render('error', {
          errorCode: 404,
          customMessage: "The blog you're looking for doesn't exist or has been deleted.",
          customTip: "Please check the URL or return to the homepage.",
        });
      } else if (error instanceof UnauthorizedError) {
        return res.status(401).render('error', {
          errorCode: 401,
          customMessage: "You are not authorized to edit this blog.",
          customTip: "This blog belongs to someone else. If you believe this is a mistake, please contact support.",
        }) 
      }
    }

    const authorPreferences = await UserModel.getUserPreferences(req.userId);
    res.render('blogs/compose', { mode: "edit", blogData: blogData, ap: authorPreferences });
  }),

  renderSavedBlogsPage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) return res.redirect('/login');

    const savedBlogs = await BlogModel.getAllSavedBlogs(req.userId, 0, PAGINATION.BLOGS_PER_PAGE);
    const userProfile = await UserModel.getProfileByUserId(req.userId);

    const authorsProfile: any[] = [];
    const commentCounts: number[] = [];
    for (const sp of savedBlogs) {
      const commentCount = await CommentModel.getCommentCount(sp.blogid);
      authorsProfile.push(sp.profiles);
      commentCounts.push(commentCount);
    }

    res.render('user_pages/saves', { user: userProfile, savedPosts: savedBlogs, authors: authorsProfile, commentCounts });
  }),

  /**
   * POST /api/blogs/:id/like - Like a blog
   */
  likeBlog: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    let { id } = req.params;

    if (!id) throw new NotFoundError('Blog');
    
    // Ensure id is a string (handle array case)
    if (Array.isArray(id)) id = id[0];

    const blog = await BlogModel.getBlogById(parseInt(id as string));
    const likeCount = await BlogModel.likeBlog(blog.blogid, req.userId);

    res.status(200).json({ id: blog.blogid, likes: likeCount });
  }),

  /**
   * POST /api/blogs/:id/save - Save a blog
   */
  saveBlog: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();
    
    let { id } = req.params;

    if (!id) throw new NotFoundError('Blog');
    
    // Ensure id is a string (handle array case)
    if (Array.isArray(id)) id = id[0];

    await BlogModel.saveBlog(parseInt(id as string), req.userId);

    res.status(200).send();
  }),

  /**
   * POST /api/blogs/fetch/from/(:uid|my-saves) - Fetch blogs with pagination
   */
  fetchBlogs: asyncHandler(async (req: Request, res: Response) => {
    const searchQuery = req.query.q as string;
    const { page = 0 } = req.body;

    let blogs
    if(req.params.uid) blogs = await BlogModel.getBlogsByAuthor(req.params.uid as string, req.userId, page, PAGINATION.BLOGS_PER_PAGE);
    else if(req.path.includes('my-saves')) blogs = await BlogModel.getAllSavedBlogs(req.userId as string, page, PAGINATION.BLOGS_PER_PAGE);
    else if(searchQuery) blogs = await BlogModel.searchBlogs(searchQuery, page, PAGINATION.BLOGS_PER_PAGE);
    else blogs = await BlogModel.getAllBlogs(page, PAGINATION.BLOGS_PER_PAGE);

    const commentCounts: number[] = [];
    for (const blog of blogs) {
      const count = await CommentModel.getCommentCount(blog.blogid);
      commentCounts.push(count);
    }

    res.status(200).json({ baps: blogs, commentCounts });
  }),

  /**
   * DELETE /api/blogs/:id/delete - Delete a blog
   */
  deleteBlog: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();
    let blogData;
    try {
      blogData = await BlogModel.getBlogById(parseInt(req.params.id as string));
      blogController.validateBlogOwnership(blogData, req.userId);
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundError) return res.status(404).json({ message: "The blog you're looking for doesn't exist or has been deleted." });
      else if (error instanceof UnauthorizedError) return res.status(401).json({ message: "You are not authorized to delete this blog." }); 
    }
    
    await storageController.deleteBlogImages(blogData.blogid);
    await BlogModel.deleteBlog(blogData.blogid);
    res.status(200).json({ message: 'Blog deleted successfully' });
  }),

  /**
   * Miscellaneous functions
   */
  validateBlogOwnership: (blogData: any, userId: string) => {
    if (blogData.authorid !== userId) throw new UnauthorizedError('You are not allowed to edit other user\'s blog');
  }
};
