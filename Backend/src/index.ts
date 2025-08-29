import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport'; 
import connectDB from './config/db.js';
import './models/userModel.js';
import './models/noteModel.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js'
import './config/passport-setup.js'; 


dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env['CLIENT_URL'] || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(passport.initialize()); 

const PORT = process.env['PORT'] || 5001;

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on :${PORT}`);
});