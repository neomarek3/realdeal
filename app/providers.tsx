"use client";

import { createContext, ReactNode, useState, useEffect, useContext } from 'react';
import AuthCheck from '@/components/AuthCheck';
import { ThemeProvider } from './providers/ThemeProvider';
import { LanguageProvider } from './providers/LanguageProvider';

// Properly define the user type
type User = {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
} | null;

// Create a proper auth context with values and methods
export const AuthContext = createContext<{
  user: User;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// AuthProvider component extracted from the Providers component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const loadAuthState = () => {
      if (typeof window !== 'undefined') {
        const auth = localStorage.getItem('authenticated') === 'true';
        setIsAuthenticated(auth);
        
        if (auth) {
          try {
            const userData = localStorage.getItem('user');
            if (userData) {
              setUser(JSON.parse(userData));
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
            // Reset auth state if user data is invalid
            localStorage.removeItem('authenticated');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
          }
        }
        setIsLoading(false);
      }
    };
    
    loadAuthState();
    
    // Listen for storage events (if user logs in/out in another tab)
    window.addEventListener('storage', loadAuthState);
    return () => window.removeEventListener('storage', loadAuthState);
  }, []);

  // Auth methods
  const login = (userData: User) => {
    if (userData) {
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      // Dispatch storage event to notify other tabs
      window.dispatchEvent(new Event('storage'));
    }
  };

  const logout = () => {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch storage event to notify other tabs
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {!isLoading && (
        <AuthCheck>
          {children}
        </AuthCheck>
      )}
    </AuthContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
} 