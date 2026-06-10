/**
 * Auth Model
 * Database operations for authentication
 */

import { auth, supabase, supabaseAdmin } from '../db';
import { DatabaseError, ValidationError } from '../utils/errors';

export class AuthModel {
  /**
   * Sign up with email and password
   */
  static async signUpWithEmail(email: string, password: string, username: string) {
    try {
      const { data, error } = await auth.signUp({ email, password, options: { data: { username } } });

      if (error) throw new ValidationError(error.message);
      return data;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await auth.signInWithPassword({ email, password });

      if (error) throw new ValidationError(error.message);
      return data;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Sign in with OAuth (Google)
   */
  static async signInWithOAuth(provider: string, redirectUrl: string) {
    try {
      const { data, error } = await auth.signInWithOAuth({
        provider: provider as any,
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: redirectUrl,
        },
      });

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Sign out
   */
  static async signOut() {
    try {
      const { error } = await auth.signOut();

      if (error) throw new DatabaseError(error.message);
      return true;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Set session from OAuth callback
   */
  static async setSession(accessToken: string, refreshToken: string) {
    try {
      const { data, error } = await auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Get current session
   */
  static async getSession() {
    try {
      const { data, error } = await auth.getSession();

      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Update user attribute
   */
  static async updateUserAttribute(attr: "password" | "email" | "data", v: any, adminConfig?: { userId: string }) {
    try {
      let action
      if(adminConfig) {
        action = await supabaseAdmin.auth.admin.updateUserById(adminConfig?.userId, { [attr]: v });
      } else {
        action = await auth.updateUser({ [attr]: v });
      }
      const { data, error } = action;
      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Verify auth request
   */
  static async verifyAuthRequest(token: string, type: "recovery") {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type
      })
      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }

  /**
   * Delete a user (Dangerous: DO NOT USE WITH CUSTOM UID)
   */
  static async deleteUser(userId: string) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw new DatabaseError(error.message);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError((error as any).message);
    }
  }
}
