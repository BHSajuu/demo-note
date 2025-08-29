
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';

// Configure Google OAuth strategy for direct Google authentication
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env['GOOGLE_CLIENT_ID'] as string,
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] as string,
      callbackURL: '/api/auth/google/callback', 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with Google ID
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user for Google authentication (no DOB required for Google auth)
        const newUser = await new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || '',
          // Note: DOB not required for Google auth, only for email signup
        }).save();

        done(null, newUser);

      } catch (error) {
        done(error, false);
      }
    }
  )
);