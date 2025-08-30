import type { Request, Response } from 'express';
import User from '../models/userModel.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Email service function - sends OTP via email

const sendEmail = async (email: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASS'],
      },
    });

    await transporter.sendMail({
      from: `"Note Taking App" <${process.env['EMAIL_USER']}>`,
      to: email,
      subject: subject,
      text: text,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Request OTP endpoint - handles both signup and signin with DOB support
export const requestOtp = async (req: Request, res: Response) => {
  const { email, name, dateOfBirth, isSignin } = req.body;

  // Log the incoming request for debugging DOB storage
  console.log('Request OTP - Received data:', { email, name, dateOfBirth, isSignin });

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // For signin, validate that user exists in database
  if (isSignin) {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: 'No account found with this email. Please sign up first.' });
    }
  } else {
    // For signup, validate all required fields including DOB from Figma design
    if (!name || !dateOfBirth) {
      return res.status(400).json({ message: 'Name, email, and date of birth are required' });
    }
    
    // Validate date format and ensure it's a valid date
    const dobDate = new Date(dateOfBirth);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date of birth format' });
    }
    
    // Check if user already exists for signup (excluding users with pending OTP)
    const existingUser = await User.findOne({ email });
    if (existingUser && !existingUser.otp) {
      return res.status(400).json({ message: 'User already exists. Please sign in instead.' });
    }
  }

  // Generate 6-digit OTP and set 10-minute expiry
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
  
  // Hash OTP for security before storing in database
  const hashedOtp = await bcrypt.hash(otp, 10);

  try {
    if (isSignin) {
      // For signin, only update OTP fields - don't modify user data
      await User.findOneAndUpdate(
        { email },
        { otp: hashedOtp, otpExpiry },
        { new: true }
      );
    } else {
      // For signup, create or update with all fields including DOB
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { 
          name, 
          email, 
          dateOfBirth: new Date(dateOfBirth), // Properly store DOB as Date object
          otp: hashedOtp, 
          otpExpiry 
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      // Log the stored user data to verify DOB is saved correctly
      console.log('User created/updated with DOB:', {
        email: updatedUser.email,
        name: updatedUser.name,
        dateOfBirth: updatedUser.dateOfBirth,
        dobType: typeof updatedUser.dateOfBirth
      });
    }
    
    // Send appropriate email based on signup vs signin
    const emailSubject = isSignin ? 'Sign In Verification Code' : 'Welcome to NoteTaker - Verification Code';
    const emailText = isSignin 
      ? `Your sign in verification code is: ${otp}. This code will expire in 10 minutes.`
      : `Welcome to NoteTaker! Your verification code is: ${otp}. This code will expire in 10 minutes.`;
    
    await sendEmail(email, emailSubject, emailText);
    
    return res.status(200).json({ 
      message: isSignin ? 'Verification code sent to your email.' : 'Account created! Verification code sent to your email.' 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error processing request', error });
  }
};

// Verify OTP endpoint - handles both signup and signin verification

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp, keepLoggedIn } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    // Find user by email and validate OTP exists
    const user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(400).json({ message: 'Invalid request. Please sign up first.' });
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiry!) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP matches the hashed version in database
    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Clear OTP fields after successful verification
    user.otp = "";
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token with appropriate expiry based on keepLoggedIn option
    const tokenExpiry = keepLoggedIn ? '30d' : '7d'; // Extended expiry if user wants to stay logged in
    const token = jwt.sign({ id: user._id }, process.env['JWT_SECRET'] as string, {
      expiresIn: tokenExpiry,
    });

    return res.status(201).json({
      message: 'Authentication successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth, // Include DOB in response for frontend
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Google OAuth callback - handles successful Google authentication

export const googleAuthCallback = (req: Request, res: Response) => {
      const user = req.user as any; 
    
      // Generate JWT token for Google authenticated user
      const token = jwt.sign({ id: user._id }, process.env['JWT_SECRET'] as string, {
        expiresIn: '7d',
      });
    
      try {
        // Redirect to frontend with token for Google auth success
        const redirectUrl = new URL('/login/success', process.env['CLIENT_URL']);
        redirectUrl.searchParams.set('token', token);
        res.redirect(redirectUrl.href);
    } catch (error) {
        console.error("Error creating redirect URL:", error);
        res.status(500).send("Internal Server Error");
    } 
};

// Get current user endpoint - returns authenticated user data

export const getMe = async (req: Request, res: Response) => {
  // Log user data retrieval for debugging
  console.log('Getting user data:', {
    userId: req.user?._id,
    email: req.user?.email,
    dateOfBirth: req.user?.dateOfBirth,
    dobType: typeof req.user?.dateOfBirth
  });
  
  // Return user data including DOB for frontend display
  const userData = {
    _id: req.user?._id,
    name: req.user?.name,
    email: req.user?.email,
    dateOfBirth: req.user?.dateOfBirth, // This will be a Date object from MongoDB
    createdAt: req.user?.createdAt,
    updatedAt: req.user?.updatedAt
  };
  
  res.status(200).json(userData);
};