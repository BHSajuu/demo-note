import type { Request, Response } from 'express';
import User from '../models/userModel.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


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

export const requestOtp = async (req: Request, res: Response) => {
  const { email, name, dateOfBirth, isSignin } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // For signin, check if user exists
  if (isSignin) {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: 'No account found with this email. Please sign up first.' });
    }
  } else {
    // For signup, validate required fields
    if (!name || !dateOfBirth) {
      return res.status(400).json({ message: 'Name, email, and date of birth are required' });
    }
  }

  const existingUser = await User.findOne({ email });
  if (existingUser && !existingUser.otp && !isSignin) { 
      return res.status(400).json({ message: 'User already exists. Please log in.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
  
  const hashedOtp = await bcrypt.hash(otp, 10);

  try {
    if (isSignin) {
      // For signin, only update OTP fields
      await User.findOneAndUpdate(
        { email },
        { otp: hashedOtp, otpExpiry },
        { new: true }
      );
    } else {
      // For signup, create or update with all fields
      await User.findOneAndUpdate(
        { email },
        { name, email, dateOfBirth: new Date(dateOfBirth), otp: hashedOtp, otpExpiry },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    
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


export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(400).json({ message: 'Invalid request. Please sign up first.' });
    }

    if (new Date() > user.otpExpiry!) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    user.otp = "";
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env['JWT_SECRET'] as string, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};


export const googleAuthCallback = (req: Request, res: Response) => {
      const user = req.user as any; 
    
      const token = jwt.sign({ id: user._id }, process.env['JWT_SECRET'] as string, {
        expiresIn: '7d',
      });
    
      try {
        const redirectUrl = new URL('/login/success', process.env['CLIENT_URL']);
        redirectUrl.searchParams.set('token', token);
        res.redirect(redirectUrl.href);
    } catch (error) {
        console.error("Error creating redirect URL:", error);
        res.status(500).send("Internal Server Error");
    } 
};


export const getMe = async (req: Request, res: Response) => {
  res.status(200).json(req.user);
};