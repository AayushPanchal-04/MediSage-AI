import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { User } from '../types';

export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN' | null;

interface AuthState {
  role: Role;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('medisage_token');
      if (storedToken) {
        const storedUserstr = localStorage.getItem('medisage_user');
        if (storedUserstr) {
          const storedUser = JSON.parse(storedUserstr);
          setUser(storedUser);
          setRole(storedUser.role);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, role, fullName, profileId } = response.data.data;
    
    localStorage.setItem('medisage_token', token);
    const userObj = { id: profileId, name: fullName, email, role };
    localStorage.setItem('medisage_user', JSON.stringify(userObj));
    
    setRole(role as Role);
    setUser(userObj as User);
  };

  const register = async (data: any) => {
    const response = await api.post('/auth/register', data);
    const { token, role, fullName, profileId, email } = response.data.data;
    
    localStorage.setItem('medisage_token', token);
    const userObj = { id: profileId, name: fullName, email, role };
    localStorage.setItem('medisage_user', JSON.stringify(userObj));
    
    setRole(role as Role);
    setUser(userObj as User);
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem('medisage_token');
    localStorage.removeItem('medisage_user');
  };

  return (
    <AuthContext.Provider value={{ role, user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
