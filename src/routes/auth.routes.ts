import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import passport from '../config/passport';
import { generateToken } from '../utils/jwt';
import {
  login,
  register,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  googleLogin,
  getUserDetails,
} from '../controllers/auth.controller';

const router: Router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.put('/profile', protect as any, updateProfile as any);
router.get('/verify-email/:token', verifyEmail as any);
router.post('/forgot-password', forgotPassword as any);
router.post('/reset-password', resetPassword as any);
router.post('/resend-verification', resendVerificationEmail as any);
router.post('/google-login', googleLogin as any);
router.get('/me', protect as any, getUserDetails as any);

// Function to handle OAuth callback and generate JWT
const handleAuthCallback = (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const token = generateToken(user);

    const data = {
      token,
      user: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        picture: user.profile_picture,
      },
    };

    // Encode the data object for safe URL passing
    const encodedData = encodeURIComponent(JSON.stringify(data));
    res.redirect(`${process.env.CLIENT_URL}/auth/success?data=${encodedData}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  handleAuthCallback
);

export default router;
