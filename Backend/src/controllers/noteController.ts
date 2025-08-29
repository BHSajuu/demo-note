import type { Request, Response } from 'express';
import Note from '../models/noteModel.js';


export const getNotes = async (req: Request, res: Response) => {
  const notes = await Note.find({ user: req.user?._id });
  return res.json(notes);
};

export const createNote = async (req: Request, res: Response) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Please add a title and content' });
  }

  const note = new Note({
    title,
    content,
    user: req.user?._id, 
  });

  const createdNote = await note.save();
  return res.status(201).json(createdNote);
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const note = await Note.findById(req.params['id']);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.user?.toString() !== req.user?._id?.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Note.findByIdAndDelete(req.params['id']);
    return res.json({ message: 'Note removed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};