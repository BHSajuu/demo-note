import express from 'express';
import passport from 'passport';
import { requestOtp, verifyOtp, googleAuthCallback, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env['CLIENT_URL']}/login/failed`,
  }),
  googleAuthCallback 
);

router.get('/me', protect, getMe);

export default router;