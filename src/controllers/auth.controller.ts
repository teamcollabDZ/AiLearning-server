import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import {
  generateVerificationToken,
  sendVerificationEmail,
  generatePasswordResetToken,
  sendPasswordResetEmail,
} from '../utils/email';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { sendUserUpdate } from '../utils/notifications';
dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      email_verified: false,
      preferences: {
        darkmode: false,
        language: 'en',
        fontSize: 16,
      },
    });

    // Generate verification token and send email
    const verificationToken = generateVerificationToken(user._id.toString());
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message:
        'Registration successful. Please check your email to verify your account.',
      token: generateToken(user),
      user: {
        last_name: user.last_name,
        first_name: user.first_name,
        email: user.email,
        email_verified: user.email_verified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(
      token,
      process.env.EMAIL_VERIFICATION_SECRET as string
    ) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.email_verified = true;
    await user.save();

    // Send real-time update to connected client
    await sendUserUpdate(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        email_verified: true,
      },
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired verification token' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user),
      user: {
        _id: user._id,
        last_name: user.last_name,
        first_name: user.first_name,
        profile_picture: user.profile_picture,
        preferences: user.preferences,
        educational_level: user.educational_level,
        email_verified: user.email_verified,
        created_at: user.created_at,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.last_name = req.body.last_name || user.last_name;
    user.first_name = req.body.first_name || user.first_name;
    user.email = req.body.email || user.email;
    user.educational_level =
      req.body.educational_level || user.educational_level;
    user.preferences = {
      ...user.preferences,
      ...req.body.preferences,
    };

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        last_name: updatedUser.last_name,
        first_name: updatedUser.first_name,
        email: updatedUser.email,
        preferences: updatedUser.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generatePasswordResetToken(user._id.toString());
    await sendPasswordResetEmail(email, resetToken);

    res.json({
      message: 'Password reset instructions sent to your email',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.EMAIL_VERIFICATION_SECRET as string
    ) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Reset link has expired' });
    }
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const verificationToken = generateVerificationToken(user._id.toString());
    await sendVerificationEmail(email, verificationToken);

    res.json({
      success: true,
      message: 'Verification email has been resent. Please check your inbox.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'No credential provided' });
    }

    // Verify Google token (this also decodes and validates it)
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Find or create user
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        first_name: payload.given_name || '',
        last_name: payload.family_name || '',
        email: payload.email,
        password: 'google-oauth',
        email_verified: true,
        profile_picture: payload.picture,
        googleId: payload.sub,
        preferences: {
          darkmode: false,
          language: 'en',
          fontSize: 16,
        },
      });
    } else {
      // Update existing user's email verification status
      user.email_verified = true;
      await user.save();
    }

    // Generate JWT token for session
    const jwtToken = generateToken(user);

    res.json({
      token: jwtToken,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        preferences: user.preferences,
        educational_level: user.educational_level,
        email_verified: user.email_verified,
        profile_picture: user.profile_picture,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        profile_picture: user.profile_picture,
        preferences: user.preferences,
        educational_level: user.educational_level,
        email_verified: user.email_verified,
        created_at: user.created_at,
        subscription_id: user.subscription_id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
