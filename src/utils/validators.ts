/**
 * Validation utility functions
 */

import { supabase } from '../db';
import { DatabaseError, ValidationError } from './errors';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase.from('profiles').select('email').eq('email', email);
  if (error) throw new ValidationError(error.message);
  return data.length !== 0
}

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric only
  const usernameRegex = /^[a-zA-Z0-9_ ]{3,50}$/;
  return usernameRegex.test(username);
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  const { data, error } = await supabase.from('profiles').select('username').eq('username', username);
  if (error) throw new ValidationError(error.message);
  return data.length !== 0
}

export const validateBlogTitle = (title: string): boolean => {
  return title.length > 0 && title.length <= 200;
};

export const validateBlogDescription = (description: string): boolean => {
  return description.length >= 0 && description.length <= 500;
};

export const validateComment = (comment: string): boolean => {
  return comment.trim().length > 0 && comment.length <= 5000;
};

export const validateBio = (bio: string): boolean => {
  return bio.length >= 0 && bio.length <= 1000;
}

export const validateSignupData = (data: any) => {
  const { userName, email, password, confirmPassword } = data;

  if (!userName || !validateUsername(userName)) {
    throw new ValidationError('Invalid username (3-20 characters, alphanumeric. Spaces and underscores are allowed)');
  }

  if (!email || !validateEmail(email)) {
    throw new ValidationError('Invalid email address');
  }

  if (!password || !validatePassword(password)) {
    throw new ValidationError('Password must be at least 8 characters with uppercases, lowercases, numbers and symbols');
  }

  if (password !== confirmPassword) {
    throw new ValidationError('Passwords do not match');
  }
};

export const validateLoginData = (data: any) => {
  const { email, password } = data;

  if (!email || !validateEmail(email)) {
    throw new ValidationError('Invalid email address');
  }

  if (!password) {
    throw new ValidationError('Password is required');
  }
};

export const validateBlogData = (data: any) => {
  const { blogTitle, blogDescription } = data;

  if (!validateBlogTitle(blogTitle)) {
    throw new ValidationError('Blog title must be between 1 and 200 characters');
  }

  if (!validateBlogDescription(blogDescription)) {
    throw new ValidationError('Blog description must be between 0 and 500 characters');
  }
};
