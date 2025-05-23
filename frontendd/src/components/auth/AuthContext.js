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
      const res = await api.get('/events'); // Assuming this fetches all approved events
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
      
      // Return the event data directly
      return res.data;
    } catch (error) {
      console.error('Error in fetchEventById:', error);
      throw error;
    }
  };

  const createEvent = async (eventData) => {
    try {
      const res = await api.post('/events', eventData);
      return res.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to create event');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const res = await api.put(`/events/${id}`, eventData);
      return res.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update event');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  };

  const fetchMyEvents = async () => {
    try {
      const res = await api.get('/users/events'); // Corrected endpoint to fetch organizer's events from userRoutes
      console.log('fetchMyEvents API Response:', res);
      console.log('fetchMyEvents API Response Data:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      throw error;
    }
  };

  const deleteEvent = async (id) => {
    try {
      const res = await api.delete(`/events/${id}`); // Assuming DELETE /events/:id endpoint
      return res.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to delete event');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
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

  const fetchMyEventAnalytics = async () => {
    try {
      const res = await api.get('/users/events/analytics');
      return res.data;
    } catch (error) {
      console.error('Error fetching event analytics:', error);
      throw error;
    }
  };

  const fetchAllEventsAsAdmin = async () => {
    try {
      const res = await api.get('/events/all'); // GET /events/all endpoint for admin
      return res.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch all events');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  };

  const updateEventStatus = async (id, status) => {
    console.log('updateEventStatus - ID:', id);
    console.log('updateEventStatus - Status:', status);
    try {
      const res = await api.put(`/events/${id}`, { status }); // Corrected endpoint to PUT /events/:id
      console.log('updateEventStatus - API Response:', res);
      return res.data;
    } catch (error) {
      console.error('updateEventStatus - Error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || `Failed to update event status.`);
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
      login,
      logout,
      forgotPassword,
      verifyResetCode,
      fetchEvents,
      fetchEventById,
      createEvent,
      updateEvent,
      fetchMyEvents,
      deleteEvent,
      updateUser,
      fetchMyEventAnalytics,
      fetchAllEventsAsAdmin,
      updateEventStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};