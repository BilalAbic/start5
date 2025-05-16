'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// User type definition
type User = {
  id: string;
  email: string;
  role: string;
};

// Auth hook response type
type UseAuthReturn = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export default function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get current user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/user');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      setUser(data.user);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Auto login after registration
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      console.error('Registration error:', err);
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Logout failed');
      }
      
      setUser(null);
      router.refresh();
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login, register, logout };
} 