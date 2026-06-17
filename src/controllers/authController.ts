/**
 * Auth Controller
 * Handles authentication related operations
 */

import { Request, Response } from 'express';
import { auth, supabase, supabaseAdmin } from '../db';
import { AuthModel } from '../models/authModel';
import { UserModel } from '../models/userModel';
import { asyncHandler } from '../middleware/errorHandler';
import { validatePassword, validateSignupData, validateLoginData, checkUsernameAvailability, checkEmailAvailability } from '../utils/validators';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import { OAUTH_CONFIG, AUTH_TYPES } from '../utils/constants';
import { UserIdentity } from "@supabase/supabase-js"
import notf_lang from "../locales"
import nodemailer from 'nodemailer';

const email_transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_TRANSPORTER_EMAIL,
    pass: process.env.NODEMAILER_TRANSPORTER_EMAIL_PASS
  }
}) 

export const authController = {
  /**
   * GET /login - Render login page
   */
  renderLoginPage: asyncHandler(async (req: Request, res: Response) => {
    if (req.userId) return res.redirect('/');
    res.render('reg/login');
  }),

  /**
   * GET /register - Render registration page
   */
  renderRegisterPage: asyncHandler(async (req: Request, res: Response) => {
    if (req.userId) return res.redirect('/');
    res.render('reg/register');
  }),

  
  /**
   * GET /auth/:reqtype - Render auth modal page
   * Supports: password-reset, email-verification, 2fa
   * Redirects to "/" if invalid auth type
   */
  renderAuthPage: asyncHandler(async (req: Request, res: Response) => {
    const { reqtype } = req.params;

    // Validate auth request type
    if (!AUTH_TYPES.includes(reqtype as string)) {
      // Invalid auth type - render auth page with invalid state
      // The EJS template will handle redirect to home
      return res.render('auth', { authType: 'invalid' });
    }

    // Render auth page with specified request type
    res.render('auth', { authType: reqtype });
  }),

  /**
   * POST /api/register/email - Register with email
   */
  registerWithEmail: asyncHandler(async (req: Request, res: Response) => {
    const { userName, email, password, confirmPassword } = req.body;

    const errmsg = (notfId: number) => notf_lang(req, "auth", "registerWithEmail", notfId)

    // Validate input
    validateSignupData({ userName, email, password, confirmPassword });
    const username_exist = await checkUsernameAvailability(userName.replace(/\s+/g, '').toLowerCase().trim());
    const email_exist = await checkEmailAvailability(email.toLowerCase().trim());
    if(username_exist) return res.status(400).redirect(`/register?error=${errmsg(1)}`);
    else if(email_exist) return res.status(400).redirect(`/register?error=${errmsg(2)}`);

    // Sign up
    const authedData = await AuthModel.signUpWithEmail(email.trim(), password, userName.trim());

    res.cookie('sb_access_token', authedData.session?.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true on Vercel
      sameSite: 'lax',
      maxAge: authedData.session?.expires_in! * 1000
    });

    res.status(201).redirect('/');
  }),

  /**
   * POST /api/register/google - Register with Google
   */
  registerWithGoogle: asyncHandler(async (req: Request, res: Response) => {
    const authUrl = await AuthModel.signInWithOAuth('google', OAUTH_CONFIG.GOOGLE_REDIRECT_URL);
    res.status(200).json({ url: authUrl.url });
  }),

  /**
   * POST /api/login/email - Login with email
   */
  loginWithEmail: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    validateLoginData({ email, password });

    // Sign in
    const authedData = await AuthModel.signInWithEmail(email, password);
    
    res.cookie('sb_access_token', authedData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true on Vercel
      sameSite: 'lax',
      maxAge: authedData.session.expires_in * 1000
    });
    
    // res.status(200).json({ message: 'Login successful' });
    res.redirect('/');
  }),

  /**
   * POST /api/login/google - Login with Google
   */
  loginWithGoogle: asyncHandler(async (req: Request, res: Response) => {
    const authUrl = await AuthModel.signInWithOAuth('google', OAUTH_CONFIG.GOOGLE_REDIRECT_URL);
    res.status(200).json({ url: authUrl.url });
  }),

  /**
   * POST /api/auth/google/callback - Handle OAuth callback
   */
  googleCallback: asyncHandler(async (req: Request, res: Response) => {
    const { access_token, refresh_token } = req.body;

    if (!access_token || !refresh_token) {
      throw new ValidationError('Missing access_token or refresh_token');
    }

    const authedData = await AuthModel.setSession(access_token, refresh_token);

    res.cookie('sb_access_token', authedData.session?.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true on Vercel
      sameSite: 'lax',
      maxAge: authedData.session?.expires_in! * 1000
    });

    res.status(200).send();
  }),

  /**
   * POST /api/logout - Logout user
   */
  logout: asyncHandler(async (req: Request, res: Response) => {
    await AuthModel.signOut();
    const msg = (notfId: number) => notf_lang(req, "auth", "logout", notfId)    

    res.clearCookie('sb_access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Must match the setting used when creating the cookie
      sameSite: 'lax'                                // Must match the setting used when creating the cookie
    });

    res.status(200).json({ message: msg(1) });
  }),

  /**
   * POST /api/auth/validate/password - Validate password (Used to verify user when dealing wiht sensitive info.)
   */
  validatePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();

    const { password } = req.body;

    await AuthModel.signInWithEmail(req.user.email, password);

    res.status(200).send();
  }),

  /**
   * PUT /api/auth/update/password - Update password
   */
  updatePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();
    
    const { oldPassword, newPassword } = req.body;

    const errmsg = (notfId: number) => notf_lang(req, "auth", "updatePassword", notfId)

    if (oldPassword) {
      try {
        await AuthModel.signInWithEmail(req.user?.email!, oldPassword);
      } catch (error) {
        console.log(error, error instanceof ValidationError);
        if (error instanceof ValidationError) return res.status(400).json({ error: errmsg(1)! })
        else throw error;
      }
    } else {
      if (
        req.user?.identities?.find((identity: UserIdentity) => identity.provider === 'email') ||
        req.user?.user_metadata?.has_password
      ) throw new ValidationError(errmsg(2)!);
    }

    if (!validatePassword(newPassword)) throw new ValidationError(errmsg(3)!);

    await AuthModel.updateUserAttribute("password", newPassword);
    await AuthModel.updateUserAttribute("data", { has_password: true });
    
    res.status(200).send();
  }),

  /**
   * POST /api/auth/reset/password - Send email to user including the reset password link
   */
  sendResetPasswordEmail: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    })

    const errmsg = (notfId: number) => notf_lang(req, "auth", "sendResetPasswordEmail", notfId)

    if(error) {
      if (error.code === 'user_not_found') return res.status(404).json({ error: errmsg(1)! })
      else throw error;
    } 

    const domainURL = process.env.NODE_ENV === 'production' ? 'https://camt-se.vercel.app/' : 'http://localhost:3000';

    const subjectText = () => {
      switch(req.language.slice(0,2)) {
        case 'en':
          return "Reset Your Password";
        case 'th':
          return "รีเซ็ตรหัสผ่าน";
      }
    }
    
    const emailHTMLContent = () => {
      switch(req.language.slice(0,2)) {
        case 'en':
          return `
            <h1>Reset Your Password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${domainURL}/auth/password-reset?token=${data.properties.hashed_token}">Reset Password</a>
          `;
        case 'th':
          return `
            <h1>รีเซ็ตรหัสผ่าน</h1>
            <p>กดลิงค์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
            <a href="${domainURL}/auth/password-reset?token=${data.properties.hashed_token}">รีเซ็ตรหัสผ่าน</a>
          `;
      }
    }
    

    const emailTextContent = () => {
      switch(req.language.slice(0,2)) {
        case 'en':
          return `Please copy and paste the link below into your browser to reset your password\n\n${domainURL}/auth/password-reset?token=${data.properties.hashed_token}`;
        case 'th':
          return `โปรดคัดลอกและวางลิงค์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ\n\n${domainURL}/auth/password-reset?token=${data.properties.hashed_token}`;
      }
    }

    await email_transporter.sendMail({
      from: `"Whiskey Security" <${process.env.NODEMAILER_TRANSPORTER_EMAIL}>`,
      to: email,
      subject: subjectText(),
      text: emailTextContent(),
      html: emailHTMLContent()
    })

    res.status(200).send();
  }),

  /**
   * PUT /api/auth/reset/password - Reset password for real
   */
  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { newPassword } = req.body;
    const authHeader = req.headers.authorization;

    const errmsg = (notfId: number) => notf_lang(req, "auth", "resetPassword", notfId)

    if (!authHeader) throw new UnauthorizedError(errmsg(1));

    const token = authHeader.split(' ')[1];

    const { data: { user }, error: authError } = await supabase.auth.getUser(token!);

    if (authError || !user) throw new UnauthorizedError(errmsg(2));

    if (!validatePassword(newPassword)) throw new ValidationError(errmsg(3)!);

    await AuthModel.updateUserAttribute("password", newPassword, { userId: user.id });
    await AuthModel.updateUserAttribute("data", { has_password: true }, { userId: user.id });
    res.status(200).send()
  }),

  verify: asyncHandler(async (req: Request, res: Response) => {
    const { token, type } = req.body;

    const errmsg = (notfId: number) => notf_lang(req, "auth", "verify", notfId)

    if (!token || !type) {
      throw new ValidationError(errmsg(1)!);
    }

    const authed = await AuthModel.verifyAuthRequest(token, type);

    res.status(200).json({ access_token: authed.session?.access_token })
  }),

  deleteAccount: asyncHandler(async (req: Request, res: Response) => {
    if(!req.userId) throw new UnauthorizedError();

    const { confirm_password } = req.body;

    const errmsg = (notfId: number) => notf_lang(req, "auth", "deleteAccount", notfId)

    try {
      await AuthModel.signInWithEmail(req.user.email, confirm_password);
    } catch (error) {
      if (error instanceof ValidationError) return res.status(400).json({ error: errmsg(1)! })
      else throw error;
    }

    await AuthModel.deleteUser(req.userId);
    await AuthModel.signOut();
    
    res.status(200).send();
  })
};
