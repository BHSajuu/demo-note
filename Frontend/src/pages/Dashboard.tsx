import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch notes on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await api.get('/notes');
        setNotes(data);
      } catch (error) {
        console.error('Failed to fetch notes', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Handle note creation
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setIsCreating(true);
    try {
      const { data: newNote } = await api.post('/notes', { title, content });
      setNotes([newNote, ...notes]); // Add new note to the beginning
      setTitle('');
      setContent('');
      setShowCreateForm(false); // Hide form after creation
    } catch (error) {
      console.error('Failed to create note', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-style header matching Figma design */}
      <div className="max-w-sm mx-auto bg-white">
        {/* Status bar simulation */}
        <div className="flex justify-between items-center px-6 py-2 text-sm font-medium">
          <span>9:41</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-black rounded-full"></div>
              <div className="w-1 h-3 bg-black rounded-full"></div>
              <div className="w-1 h-3 bg-black rounded-full"></div>
              <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
            </div>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48L5.5 12l-.65-.95zM6.5 12l1.15 1.95L8.5 12l-.85-1.48L6.5 12zm3 0l1.15 1.95L11.5 12l-.85-1.48L9.5 12zm3 0l1.15 1.95L14.5 12l-.85-1.48L12.5 12zm3 0l1.15 1.95L17.5 12l-.85-1.48L15.5 12zm3 0l1.15 1.95L20.5 12l-.85-1.48L18.5 12z"/>
            </svg>
            <div className="w-6 h-3 border border-black rounded-sm">
              <div className="w-4 h-1 bg-black rounded-sm mt-0.5 ml-0.5"></div>
            </div>
          </div>
        </div>

        {/* Header with HD logo and Dashboard title - exact Figma layout */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">Dashboard</span>
          </div>
          <button
            onClick={logout}
            className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome section - exact Figma styling */}
        <div className="px-6 py-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Welcome, {user?.name} !
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Email: {user?.email?.replace(/(.{6}).*(@.*)/, '$1****$2')}
          </p>

          {/* Create Note button - exact Figma blue button styling */}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-6"
          >
            Create Note
          </button>

          {/* Create note form - shown when Create Note is clicked */}
          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleCreateNote} className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note content here..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={isCreating || !title.trim() || !content.trim()}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                  >
                    {isCreating ? 'Creating...' : 'Save Note'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setTitle('');
                      setContent('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notes section - exact Figma styling */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note, index) => (
                  <div
                    key={note._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {note.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {note.content}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="ml-4 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                      title="Delete note"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">No notes yet</h3>
                <p className="text-gray-500 text-sm">Create your first note to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom indicator - mobile-style home indicator */}
        <div className="flex justify-center py-4">
          <div className="w-32 h-1 bg-black rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;