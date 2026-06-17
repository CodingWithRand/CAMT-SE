/**
 * Page Controller
 * Handles static page rendering
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { STATIC_CONTENT } from '../utils/constants';
import nodemailer from 'nodemailer';
import notf_lang from '../locales';

const email_transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_TRANSPORTER_EMAIL,
    pass: process.env.NODEMAILER_TRANSPORTER_EMAIL_PASS
  }
}) 

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

  /**
   * GET /media - Render media attribution page
   */
  renderMediaAttributionPage: asyncHandler(async (req: Request, res: Response) => {
    res.render('others/media-attribution');
  }),

  sendContact: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) res.status(400).json({ message: notf_lang(req, "page", "sendContact", 1) });

    await email_transporter.sendMail({
      from: `${name} <${email}>`,
      to: process.env.NODEMAILER_TRANSPORTER_EMAIL,
      subject: `[Support Ticket] ${subject}`,
      text: `You received a new message from your contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
          <h3>New Support Ticket</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
      `
    })
  })
};
