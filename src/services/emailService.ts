import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const emailConfig = {
  host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  port: parseInt(process.env['SMTP_PORT'] || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS']
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email templates
const emailTemplates = {
  signupOTP: (otp: string, email: string) => ({
    subject: 'Verify Your Email - IFA Labs Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Welcome to IFA Labs Dashboard!</h2>
        <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email from IFA Labs Dashboard.</p>
      </div>
    `
  }),

  loginOTP: (otp: string) => ({
    subject: 'Login Verification - IFA Labs Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Login Verification Required</h2>
        <p>Please use the following OTP to complete your login:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't attempt to login, please secure your account immediately.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email from IFA Labs Dashboard.</p>
      </div>
    `
  }),

  passwordResetOTP: (otp: string) => ({
    subject: 'Password Reset - IFA Labs Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>You requested to reset your password. Please use the following OTP to proceed:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email from IFA Labs Dashboard.</p>
      </div>
    `
  }),

  emailVerified: (email: string) => ({
    subject: 'Email Verified - IFA Labs Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745; text-align: center;">Email Verification Successful!</h2>
        <p>Congratulations! Your email address <strong>${email}</strong> has been successfully verified.</p>
        <p>You can now set your password and access your account.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email from IFA Labs Dashboard.</p>
      </div>
    `
  }),

  passwordSet: () => ({
    subject: 'Password Set Successfully - IFA Labs Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745; text-align: center;">Password Set Successfully!</h2>
        <p>Your password has been set successfully. You can now log in to your account.</p>
        <p>If you didn't set this password, please contact support immediately.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated email from IFA Labs Dashboard.</p>
      </div>
    `
  })
};

// Email service class
export class EmailService {
  // Send OTP for signup
  static async sendSignupOTP(email: string, otp: string): Promise<boolean> {
    try {
      const template = emailTemplates.signupOTP(otp, email);
      await transporter.sendMail({
        from: process.env['SMTP_FROM'] || process.env['SMTP_USER'],
        to: email,
        subject: template.subject,
        html: template.html
      });
      return true;
    } catch (error) {
      console.error('Error sending signup OTP:', error);
      return false;
    }
  }

  // Send OTP for login
  static async sendLoginOTP(email: string, otp: string): Promise<boolean> {
    try {
      const template = emailTemplates.loginOTP(otp);
      await transporter.sendMail({
        from: process.env['SMTP_FROM'] || process.env['SMTP_USER'],
        to: email,
        subject: template.subject,
        html: template.html
      });
      return true;
    } catch (error) {
      console.error('Error sending login OTP:', error);
      return false;
    }
  }

  // Send OTP for password reset
  static async sendPasswordResetOTP(email: string, otp: string): Promise<boolean> {
    try {
      const template = emailTemplates.passwordResetOTP(otp);
      await transporter.sendMail({
        from: process.env['SMTP_FROM'] || process.env['SMTP_USER'],
        to: email,
        subject: template.subject,
        html: template.html
      });
      return true;
    } catch (error) {
      console.error('Error sending password reset OTP:', error);
      return false;
    }
  }

  // Send email verification success
  static async sendEmailVerified(email: string): Promise<boolean> {
    try {
      const template = emailTemplates.emailVerified(email);
      await transporter.sendMail({
        from: process.env['SMTP_FROM'] || process.env['SMTP_USER'],
        to: email,
        subject: template.subject,
        html: template.html
      });
      return true;
    } catch (error) {
      console.error('Error sending email verified notification:', error);
      return false;
    }
  }

  // Send password set success
  static async sendPasswordSet(email: string): Promise<boolean> {
    try {
      const template = emailTemplates.passwordSet();
      await transporter.sendMail({
        from: process.env['SMTP_FROM'] || process.env['SMTP_USER'],
        to: email,
        subject: template.subject,
        html: template.html
      });
      return true;
    } catch (error) {
      console.error('Error sending password set notification:', error);
      return false;
    }
  }

  // Test email configuration
  static async testConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;
