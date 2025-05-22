import React, { createContext, useState } from 'react';
import api from '../../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password });
      if (res.data.user) {
        setUser(res.data.user);
        // Store the token in localStorage
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        return res;
      } else {
        throw new Error('No user data in response');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Server error occurred');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token'); // Clear the token on logout
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/forgetpassword', { email });
      return res.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const verifyResetCode = async (email, code, newPassword) => {
    try {
      const res = await api.post('/verifyresetpassword', { email, verificationCode: code, newPassword });
      return res.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Verification failed');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Unexpected error');
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      return res;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  };

  const fetchEventById = async (id) => {
    try {
      console.log('Making API request for event ID:', id);
      const res = await api.get(`/events/${id}`);
      console.log('API Response:', res);
      
      if (!res.data) {
        throw new Error('Event not found');
      }
      
      // Return the entire response object
      return res;
    } catch (error) {
      console.error('Error in fetchEventById:', error);
      throw error;
    }
  };

  const updateUser = async (userData) => {
    try {
      const res = await api.put('/users/profile', userData);
      if (res.data.user) {
        setUser(res.data.user);
        return res.data.user;
      } else {
        throw new Error('No user data in response');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update profile');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      forgotPassword, 
      verifyResetCode, 
      fetchEvents,
      fetchEventById,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};