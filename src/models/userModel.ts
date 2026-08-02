/**
 * User Model
 * Database operations for users and profiles
 */

import { supabase } from '../db';
import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError, NotFoundError } from '../utils/errors';

export class UserModel {
  /**
   * Get user profile by user ID
   */
  static async getProfileByUserId(userId: string) {
    try {
      const table = supabase
        .from('profiles')
      let query;

      if(userId === (await supabase.auth.getUser()).data?.user?.id) {
        query = await table.select('*').eq('uid', userId).single();
      } else {
        query = await table.select('*, user_preferences!inner(visible_profile)')
          .eq('uid', userId)
          .eq('user_preferences.visible_profile', true)
          .single();
      }

      const { data, error } = query;

      if (error) throw new DatabaseError(error.message);
      if (!data) throw new NotFoundError('User profile');

      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get user profile by user ID with specific properties
   */
  static async getProfileProperty(userId: string, property: string) {
    try {
      const { data, error }: { data: any, error: any } = await supabase
        .from('profiles')
        .select(property)
        .eq('uid', userId)
        .single();

      if (error) throw new DatabaseError(error.message);
      if (!data) throw new NotFoundError('User profile');

      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(supabase: SupabaseClient<any, "public", "public", any, any>, userId: string, updateData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('uid', userId)
        .select('*')

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get profile by username (for public profile pages)
   */
  static async getProfileByUsername(username: string) {
    try {
      const table = supabase.from('profiles')

      const { data: profileFromUsername, error: profileFromUsernameError } = await table
        .select('*')
        .eq('username', username);

      if (profileFromUsernameError) throw new DatabaseError(profileFromUsernameError.message);

      let query;
      if (profileFromUsername && profileFromUsername[0]?.uid === (await supabase.auth.getUser()).data?.user?.id) {
        query = { data: profileFromUsername, error: null };
      } else {
        query = await table
          .select('*, user_preferences!inner(visible_profile)')
          .eq('username', username)
          .eq('user_preferences.visible_profile', true)
      }

      const { data, error } = query;

      if (error) throw new DatabaseError(error.message);
      if (!data || data.length === 0) throw new NotFoundError('User');

      return data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get user's saved blogs ids
   */
  static async getUserSavedBlogIds(supabase: SupabaseClient<any, "public", "public", any, any>, userId: string) {
    try {
      const { data, error } = await supabase
        .from('saved_blogs')
        .select('blogid')
        .eq('uid', userId);

      if (error) throw new DatabaseError(error.message);
      return data?.map((item: any) => item.blogid) || [];
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get post count of a user.
   */
  static async getPostCount(authorId: string) {
    try {
      const { count, error } = await supabase
        .from('blogs')
        .select('*', { count: 'estimated', head: true })
        .eq('authorid', authorId);

      if (error) throw new DatabaseError(error.message);
      return count || 0;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get user's preferences settings
   */
  static async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('uid', userId)

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Update user's preferences settings
   */
  static async updateUserPreferences(supabase: SupabaseClient<any, "public", "public", any, any>, userId: string, preferencesData: any) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(preferencesData)
        .eq('uid', userId)
        .select('*');

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }
}
