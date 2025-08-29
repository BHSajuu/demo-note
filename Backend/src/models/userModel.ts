import mongoose from 'mongoose';
import type { IUser } from '../types/index.js';

// User schema with DOB field as required by Figma design
const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Date of Birth field - required for email signup as per Figma design
    dateOfBirth: {
      type: Date,
      // Not required for Google auth users, only for email signup
    },
    // Google ID for Google OAuth users
    googleId: { 
      type: String,
    },
    // OTP fields for email verification
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true, 
  }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;