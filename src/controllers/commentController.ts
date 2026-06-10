/**
 * Comment Controller
 * Handles comment related operations
 */

import { Request, Response } from 'express';
import { CommentModel } from '../models/commentModel';
import { UserModel } from '../models/userModel';
import { asyncHandler } from '../middleware/errorHandler';
import { validateComment } from '../utils/validators';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors';
import { PAGINATION } from '../utils/constants';

export const commentController = {
  /**
   * POST /api/comments - Create a comment
   */
  createComment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    const { blogid, comment, replyTo } = req.body;

    if (!blogid || !comment) {
      throw new ValidationError('Blog ID and comment text are required');
    }

    // Validate comment
    validateComment(comment);

    // Create comment
    const newComment = await CommentModel.createComment(
      parseInt(blogid),
      req.userId,
      comment,
      replyTo || undefined
    );

    // Get author profile
    const authorProfile = await UserModel.getProfileByUserId(req.userId);

    res.status(200).json({
      comment: newComment,
      comment_author: authorProfile,
    });
  }),

  /**
   * POST /api/comments/fetch - Fetch comments with pagination
   */
  fetchComments: asyncHandler(async (req: Request, res: Response) => {
    const { blogid, isReply, ownerComment, page = 0 } = req.body;

    if (!blogid) {
      throw new ValidationError('Blog ID is required');
    }

    let comments;

    if (isReply && ownerComment) {
      // Fetch replies to a comment
      comments = await CommentModel.getReplies(
        parseInt(blogid),
        ownerComment,
        page,
        PAGINATION.COMMENTS_PER_PAGE
      );
    } else {
      // Fetch main comments
      comments = await CommentModel.getComments(
        parseInt(blogid),
        page,
        PAGINATION.COMMENTS_PER_PAGE
      );

    }
    // Check for replies for each comment
    for (let i = 0; i < comments.length; i++) {
      const hasReplies = await CommentModel.hasReplies(parseInt(blogid), comments[i].cid);
      if (hasReplies) {
        comments[i].hasReplies = true;
      }
    }

    res.status(200).json({ caps: comments });
  }),

  /**
   * POST /api/comments/:id/like - Like a comment
   */
  likeComment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    let { id } = req.params;

    if (!id) throw new NotFoundError('Comment');
    
    // Ensure id is a string (handle array case)
    if (Array.isArray(id)) id = id[0];

    const comment = await CommentModel.getCommentById(id as string);
    if (!comment) throw new NotFoundError('Comment');

    const likeCount = await CommentModel.likeComment(comment.cid, req.userId);

    res.status(200).json({ id: comment.cid, likes: likeCount });
  }),

  /**
   * PUT /api/comments/:id/edit - Edit a comment
   */
  editComment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    let { id } = req.params;
    let { commentContent } = req.body;

    if (!id) throw new NotFoundError('Comment');

    let comment
    try {
      comment = await CommentModel.getCommentById(id as string); 
      commentController.validateCommentOwnership(comment, req.userId);
    } catch (error) {
      if (error instanceof NotFoundError) return res.status(404).json({ message: "Comment not found." });
      else if (error instanceof UnauthorizedError) return res.status(401).json({ message: "You can't edit another person's comment." }); 
    }

    await CommentModel.editComment(id as string, req.userId, commentContent);
    res.status(200).send();
  }),

  /**
   * DELETE /api/comments/:id/delete - Delete a comment
   */
  deleteComment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    let { id } = req.params;

    if (!id) throw new NotFoundError('Comment');

    let comment
    try {
      comment = await CommentModel.getCommentById(id as string); 
      commentController.validateCommentOwnership(comment, req.userId);
    } catch (error) {
      if (error instanceof NotFoundError) return res.status(404).json({ message: "Comment not found." });
      else if (error instanceof UnauthorizedError) return res.status(401).json({ message: "You can't delete another person's comment." }); 
    }

    await CommentModel.deleteComment(id as string, req.userId);
    res.status(200).send();
  }),

  /**
   * Miscellaneous functions
   */
  validateCommentOwnership: (commentData: any, userId: string) => {
    if (commentData.authorid !== userId) throw new UnauthorizedError("This comment doesn't belong to you.")
  }
};
