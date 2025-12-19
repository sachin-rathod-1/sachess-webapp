import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import websocketService from '../services/websocket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('chessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (token && user) {
      websocketService.connect(token)
        .then(() => {
          setWsConnected(true);
        })
        .catch((error) => {
          console.error('WebSocket connection failed:', error);
          setWsConnected(false);
        });
    } else {
      websocketService.disconnect();
      setWsConnected(false);
    }

    return () => {
      if (!token) {
        websocketService.disconnect();
      }
    };
  }, [token, user]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, ...userData } = response.data;

      localStorage.setItem('chessToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid email or password'
      };
    }
  }, []);

  const signup = useCallback(async (username, email, password) => {
    try {
      const response = await authAPI.signup(username, email, password);
      const { token: newToken, ...userData } = response.data;

      localStorage.setItem('chessToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('chessToken');
    localStorage.removeItem('user');
    websocketService.disconnect();
    setToken(null);
    setUser(null);
    setWsConnected(false);
  }, []);

  const updateUser = useCallback((userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user]);

  const value = {
    user,
    token,
    loading,
    wsConnected,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
