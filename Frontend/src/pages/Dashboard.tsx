import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Note {
  _id: string;
  title: string;
  content: string;
}

const Dashboard = () => {
  const {user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await api.get('/notes');
        setNotes(data);
      } catch (error) {
        console.error('Failed to fetch notes', error);
      }
    };
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: newNote } = await api.post('/notes', { title, content });
      setNotes([...notes, newNote]);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Failed to create note', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  return (
    <div>
      <header className="p-4 bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Notes</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.name}!</span>
            <button onClick={logout} className="px-4 py-2 text-white bg-red-500 rounded-md">Logout</button>
          </div>
        </div>
      </header>

      <main className="container p-4 mx-auto mt-6">
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Create a New Note</h2>
            <form onSubmit={handleCreateNote}>
                <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Note title" required className="w-full p-3 mb-4 border rounded-md" />
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Note content..." required className="w-full p-3 mb-4 border rounded-md" rows={4}></textarea>
                <button type="submit" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md">Add Note</button>
            </form>
        </div>

        <div>
            <h2 className="mb-4 text-xl font-semibold">Your Notes</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {notes.length > 0 ? notes.map(note => (
                    <div key={note._id} className="p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-lg font-bold">{note.title}</h3>
                        <p className="mt-2 text-gray-700">{note.content}</p>
                        <button onClick={() => handleDeleteNote(note._id)} className="mt-4 text-sm text-red-500">Delete</button>
                    </div>
                )) : <p>You have no notes yet. Create one above!</p>}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;