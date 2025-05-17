import React, { createContext, useState } from 'react';
import api from '/Users/asermohamed/Desktop/Software/Frontend/frontendd/src/services/api.js'; // your axios instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email }); // Log login attempt
      const res = await api.post('/auth/login', { email, password }); // Removed duplicate /api/v1
      console.log('Login response:', res.data); // Log response
      
      if (res.data.user) {
        setUser(res.data.user);
        return res;
      } else {
        throw new Error('No user data in response');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // Throw a more detailed error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data?.message || 'Server error occurred');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'An unexpected error occurred');
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

  return (
    <AuthContext.Provider value={{ user, login, fetchEvents }}>
      {children}
    </AuthContext.Provider>
  );
};