/**
 * Blog Model
 * Database operations for blogs
 */

import { supabase } from '../db';
import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError, NotFoundError } from '../utils/errors';
import { PAGINATION } from '../utils/constants';
import { UserModel } from './userModel';

export class BlogModel {
  /**
   * Create a new blog post
   */
  static async createBlog(supabase: SupabaseClient<any, "public", "public", any, any>, userId: string, blogData: any) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .insert({
          title: blogData.blogTitle,
          description: blogData.blogDescription,
          content: blogData.content,
          authorid: userId,
          visibility: blogData.visibility,
          allow_comments: blogData.allowComments
        })
        .select('blogid')
        .single();

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Update blog
   */
  static async updateBlog(supabase: SupabaseClient<any, "public", "public", any, any>, blogId: number, new_blog_data: any) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .update({ ...new_blog_data })
        .eq('blogid', blogId)
        .select('*');

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Delete blog
   */
  static async deleteBlog(supabase: SupabaseClient<any, "public", "public", any, any>, blogId: number) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .delete()
        .eq('blogid', blogId)
        .select('*');
      
      if (error) throw new DatabaseError(error.message);
      if (!data || data.length === 0) throw new NotFoundError('Blog');
      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get blog by ID
   */
  static async getBlogById(blogId: number) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*, profiles(*, user_preferences(visible_profile))')
        .eq('profiles.user_preferences.visible_profile', true)
        .eq('blogid', blogId);

      if (error) throw new DatabaseError(error.message);
      if (!data || data.length === 0) throw new NotFoundError('Blog');

      return data[0];
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get all blogs ordered by date with pagination
   */
  static async getAllBlogs(page: number = 0, limit: number = PAGINATION.BLOGS_PER_PAGE) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*, profiles!inner(*, user_preferences!inner(visible_profile))')
        .eq('visibility', 2) // Only public blogs
        .eq('profiles.user_preferences.visible_profile', true) // Only from authors with visible profiles
        .order('postedon', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw new DatabaseError(error.message);
      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  static async getAllSavedBlogs(userId: string, page: number = 0, limit: number = PAGINATION.BLOGS_PER_PAGE) {
    try {
      const { saved_blogs } = await UserModel.getProfileProperty(userId, 'saved_blogs');
      if(!saved_blogs || saved_blogs.length === 0) return [];

      const savedBlogsQuery = await supabase
        .from('blogs')
        .select('*, profiles!inner(*, user_preferences!inner(visible_profile))')
        .in('blogid', saved_blogs)
        .eq('visibility', 2) // Only public blogs
        .eq('profiles.user_preferences.visible_profile', true) // Only from authors with visible profiles
        .order('postedon', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (savedBlogsQuery.error) throw new DatabaseError(savedBlogsQuery.error.message);
      return savedBlogsQuery.data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get featured blogs (limit 5)
   */
  static async getFeaturedBlogs(limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('blogs_with_likes_count')
        .select(`*, profiles!inner(*, user_preferences!inner(visible_profile))`)
        .eq('profiles.user_preferences.visible_profile', true) // Only from authors with visible profiles
        .eq('visibility', 2) // Only public blogs
        .order('likes', { ascending: false })
        .range(0, limit);

      if (error) throw new DatabaseError(error.message);

      return (data || []).map((p) => ({
        blogid: p.blogid,
        description: p.description,
        title: p.title,
        content: p.content,
        likes: p.likes || 0,
        author_profile: p.profiles
      }));
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get latest blogs
   */
  static async getLatestBlogs(limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('blogs_with_likes_count')
        .select('*, profiles!inner(*, user_preferences!inner(visible_profile))')
        .eq('visibility', 2) // Only public blogs
        .eq('profiles.user_preferences.visible_profile', true) // Only from authors with visible profiles
        .order('postedon', { ascending: false })
        .range(0, limit);

      if (error) throw new DatabaseError(error.message);

      return (data || []).map((p) => ({
        blogid: p.blogid,
        description: p.description,
        title: p.title,
        content: p.content,
        likes: p.likes || 0,
        author_profile: p.profiles
      }));
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Like a blog post
   */
  static async likeBlog(supabase: SupabaseClient<any, "public", "public", any, any>, blogId: number, userId: string) {
    try {
      const { data, error } = await supabase.rpc('like_blog', {
        target_blog_id: blogId,
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
   * Save a blog post
   */
  static async saveBlog(supabase: SupabaseClient<any, "public", "public", any, any>, blogId: number, userId: string) {
    try {
      const { data, error } = await supabase.rpc('save_post', {
        actor_user_id: userId,
        saving_post_id: blogId
      })

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get author profile for a blog
   */
  static async getAuthorProfile(userId: string) {
    return await UserModel.getProfileByUserId(userId);
  }

  /**
   * Get blogs by author with visibility filtering
   */
  static async getBlogsByAuthor(authorId: string, currentUserId?: string, page: number = 0, limit: number = PAGINATION.BLOGS_PER_PAGE) {
    try {
      const table = supabase
        .from('blogs');
      let query;
        
        // If viewing own profile, show all (public, unlisted, private)
        // If viewing other's profile, show only public
      if (currentUserId === authorId) {
        query = table
          .select('*, profiles(*)')
          .range(page * limit, (page + 1) * limit - 1) // Include author profile
          .eq('authorid', authorId);
      } else {
        query = table
          .select('*, profiles!inner(*, user_preferences!inner(visible_profile))')
          .range(page * limit, (page + 1) * limit - 1) // Include author profile
          .eq('authorid', authorId)
          .eq('profiles.user_preferences.visible_profile', true) // Only from authors with visible profiles
          .eq('visibility', 2) // 2 = public
        }

      const { data, error } = await query.order('postedon', { ascending: false });

      if (error) throw new DatabaseError(error.message);
      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Search blogs by title or description (full-text search)
   */
  static async searchBlogs(searchQuery: string, page: number = 0, limit: number = PAGINATION.BLOGS_PER_PAGE) {
    try {
      const searchTerm = `%${searchQuery}%`;
      
      const { data, error } = await supabase
        .from('blogs')
        .select('*, profiles!inner(*, user_preferences!inner(visible_profile))')
        .eq('visibility', 2) // Only public blogs
        .eq('profiles.user_preferences.visible_profile', true) // Only from authors with visible profiles
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order('postedon', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw new DatabaseError(error.message);
      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }
}
