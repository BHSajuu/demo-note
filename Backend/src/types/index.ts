import type { Request } from 'express';
import type { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  googleId?: string;
  otp?: string;
  otpExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface INote extends Document {
  title: string;
  content: string;
  user: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}