import mongoose from 'mongoose';
import type { INote } from '../types/index.js';

const noteSchema = new mongoose.Schema<INote>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', 
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model<INote>('Note', noteSchema);

export default Note;