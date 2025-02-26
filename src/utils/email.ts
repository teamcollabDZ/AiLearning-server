import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aziz.khaldi100@gmail.com',
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const generateVerificationToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.EMAIL_VERIFICATION_SECRET as string, {
    expiresIn: '24h',
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${process.env.CLIENT_URL}/auth/verify-email/${token}`;

  const mailOptions = {
    from: `"AiLearning" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to AiLearning - Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="${process.env.CLIENT_URL}/logo.png" alt="AiLearning Logo" style="max-width: 200px; margin-bottom: 20px;">
            <h1 style="color: #333333; margin-bottom: 20px;">Welcome to AiLearning!</h1>
            <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for joining our learning platform. To get started, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666666; font-size: 14px;">This verification link will expire in 24 hours for security reasons.</p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
            <p style="color: #999999; font-size: 12px;">If you didn't create an account with AiLearning, please ignore this email.</p>
            <p style="color: #999999; font-size: 12px;">Need help? Contact our support team at ${process.env.SUPPORT_EMAIL}</p>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const generatePasswordResetToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.EMAIL_VERIFICATION_SECRET as string, {
    expiresIn: '1h',
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"AiLearning" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - AiLearning',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333333; margin-bottom: 20px;">Password Reset Request</h1>
            <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
            <p style="color: #999999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
