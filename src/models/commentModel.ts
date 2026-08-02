/**
 * Comment Model
 * Database operations for comments
 */

import { supabase } from '../db';
import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError, NotFoundError } from '../utils/errors';
import { PAGINATION } from '../utils/constants';

export class CommentModel {
  /**
   * Create a new comment
   */
  static async createComment(supabase: SupabaseClient<any, "public", "public", any, any>, blogId: number, userId: string, commentText: string, replyTo?: number) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          blogid: blogId,
          comment: commentText,
          replyto: replyTo || null,
          authorid: userId,
        })
        .select('*')
        .single();

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get main comments for a blog (not replies)
   */
  static async getComments(
    blogId: number,
    page: number = 0,
    limit: number = PAGINATION.COMMENTS_PER_PAGE
  ) {
    try {
      const { data, error } = await supabase
        .from('comments_with_likes_count')
        .select('*, profiles!comments_authorid_fkey(*, user_preferences(visible_profile))')
        .eq('blogid', blogId)
        .is('replyto', null)
        .order('createdat', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw new DatabaseError(error.message);
      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get comment count for blog.
   */
  static async getCommentCount(blogId: number) {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'estimated', head: true })
        .eq('blogid', blogId);

      if (error) throw new DatabaseError(error.message);
      return count || 0;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get replies to a specific comment
   */
  static async getReplies(
    blogId: number,
    parentCommentId: number,
    page: number = 0,
    limit: number = PAGINATION.COMMENTS_PER_PAGE
  ) {
    try {
      const { data, error } = await supabase
        .from('comments_with_likes_count')
        .select('*, profiles!comments_authorid_fkey(*, user_preferences(visible_profile))')
        .eq('blogid', blogId)
        .eq('replyto', parentCommentId)
        .order('createdat', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw new DatabaseError(error.message);
      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Check if a comment has replies
   */
  static async hasReplies(blogId: number, commentId: number) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('replyto')
        .eq('blogid', blogId)
        .eq('replyto', commentId);

      if (error) throw new DatabaseError(error.message);
      return (data?.length || 0) > 0;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Like a comment
   */
  static async likeComment(supabase: SupabaseClient<any, "public", "public", any, any>, commentId: number, userId: string) {
    try {
      const { data, error } = await supabase.rpc('like_comment', {
        target_comment_id: commentId,
        new_user_id: userId,
      });

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get comment by ID
   */
  static async getCommentById(commentId: string) {
    try {
      const { data, error } = await supabase
        .from('comments_with_likes_count')
        .select('cid, likes, authorid')
        .eq('cid', commentId)
        .single();

      if (error) throw new DatabaseError(error.message);
      if (!data) throw new NotFoundError('Comment');

      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  static async editComment(supabase: SupabaseClient<any, "public", "public", any, any>, commentId: string, userId: string, newContent: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ comment: newContent })
        .eq('cid', commentId)
        .eq('authorid', userId)
        .is('locked', false)
        .select('*')

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  static async deleteComment(supabase: SupabaseClient<any, "public", "public", any, any>, commentId: string, userId: string) {
    // Decision needed: 
    // Reddit delete (current -> edit the comment as [Deleted] and lock it while keeping replies.) 
    // or 
    // Real delete (remove the entire comment)
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ comment: '[Deleted]', locked: true })
        .eq('cid', commentId)
        .eq('authorid', userId)
        .select('*')
      
      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }
}
