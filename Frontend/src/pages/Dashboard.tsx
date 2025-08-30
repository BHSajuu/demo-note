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
    <div className="min-h-screen bg-gray-50">
      {/* Responsive container - mobile-style on small screens, desktop on large screens */}
      <div className="lg:max-w-4xl lg:mx-auto lg:py-8">
        <div className="bg-white lg:rounded-2xl lg:shadow-lg overflow-hidden">
          {/* Mobile-style status bar - only visible on small screens */}
          <div className="lg:hidden flex justify-between items-center px-6 py-2 text-sm font-medium bg-white">
            <span>9:41</span>
            <div className="flex items-center space-x-1">
              {/* Signal strength indicator */}
              <div className="flex space-x-1">
                <div className="w-1 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-3 bg-black rounded-full"></div>
                <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
              </div>
              {/* WiFi icon */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
              </svg>
              {/* Battery icon */}
              <div className="w-6 h-3 border border-black rounded-sm">
                <div className="w-4 h-1 bg-black rounded-sm mt-0.5 ml-0.5"></div>
              </div>
            </div>
          </div>

          {/* Header with HD logo and Dashboard title - responsive design */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center">
              {/* HD Logo with blue star icon matching Figma */}
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
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

          {/* Main content area - responsive padding */}
          <div className="px-6 py-6 lg:px-8 lg:py-8">
            {/* Welcome section - exact Figma styling */}
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                Welcome, {user?.name}!
              </h1>
              <p className="text-gray-500 text-sm">
                {/* Mask email for privacy - show first 6 chars and domain */}
                Email: {user?.email?.replace(/(.{6}).*(@.*)/, '$1****$2')}
              </p>
            </div>

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
                  {notes.map((note) => (
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
                      {/* Delete button with trash icon matching Figma */}
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

          {/* Bottom indicator - mobile-style home indicator - only visible on small screens */}
          <div className="lg:hidden flex justify-center py-4">
            <div className="w-32 h-1 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;