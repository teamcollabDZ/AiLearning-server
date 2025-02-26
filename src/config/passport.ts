import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/api/auth/google/callback',
      scope: ['openid', 'profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('Profile:', profile);
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            first_name: profile.name?.givenName || '',
            last_name: profile.name?.familyName || '',
            email: profile.emails?.[0].value,
            password: 'google-oauth', // placeholder password
            email_verified: true,
            googleId: profile.id,
            profile_picture: profile.photos?.[0].value,
            preferences: {
              darkmode: false,
              language: 'en',
              fontSize: 16,
            },
          });
        }

        done(null, user);
      } catch (err) {
        console.error('Error processing Google login:', err);
        done(err as Error, undefined);
      }
    }
  )
);

export default passport;
