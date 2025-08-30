
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import type {ReactNode} from "react"
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// User interface matching backend user model
interface User {
  _id: string; 
  name: string;
  email: string;
  dateOfBirth?: string | Date; // Optional since Google auth users may not have DOB - can be Date object or ISO string from backend
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Logout function - clears auth state and redirects to signin
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    navigate('/signin'); // Navigate to signin page after logout
  }, [navigate]);

  // Load user data from stored token on app initialization
  useEffect(() => {
    const loadUserFromToken = async () => {
      if (token) {
        try {
          // Fetch user data using stored token
          const { data } = await api.get('/auth/me');
          // Log received user data to verify DOB is properly retrieved
          console.log('User data loaded from token:', {
            name: data.name,
            email: data.email,
            dateOfBirth: data.dateOfBirth,
            dobType: typeof data.dateOfBirth
          });
          setUser(data);
        } catch (error) {
          // Clear invalid token
          console.error("Invalid token, logging out.");
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    setIsLoading(true);
    loadUserFromToken();
  }, [token]); 

  // Login function - stores token and navigates to dashboard
  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken); 
    navigate('/dashboard');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};