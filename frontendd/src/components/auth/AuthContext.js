import React, { createContext, useState, useEffect } from 'react';
import api from '../../services/api.js';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from local storage on component mount
  useEffect(() => {
    loadUser();
  }, []); // Empty dependency array means this effect runs only once on mount

  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const response = await api.post('/users/login', { email, password });
      console.log('Login API response:', response.data); // Log the full response data

      if (response.data.token && response.data.user) {
        // Normal login success (no MFA or MFA already verified)
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user); // Set user only if provided
        setIsAuthenticated(true);
        setMfaRequired(false); // Ensure MFA is not marked as required in state
        setTempToken(null); // Clear temp token
        toast.success('Login successful!');
        return { success: true, user: response.data.user }; // Indicate success and return user
      } else if (response.data.mfaRequired) {
        // MFA is required
        console.log('MFA required based on login response.');
        setMfaRequired(true); // Set MFA required state
        setTempToken(response.data.tempToken); // Store the temporary token in context
        // Do NOT set the main user state yet
        // Do NOT set isAuthenticated to true yet
        return { mfaRequired: true, tempToken: response.data.tempToken }; // Indicate MFA required
      } else {
        // Unexpected response structure
        console.error('Login received unexpected data structure:', response.data);
        throw new Error('Login failed: Unexpected server response.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Server error occurred');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  };

  const verifyMfa = async (mfaCode) => {
    try {
      if (!mfaCode || !tempToken) {
        console.error('Missing required data:', { mfaCode: !!mfaCode, tempToken: !!tempToken });
        throw new Error('MFA code and temporary token are required');
      }

      console.log('Verifying MFA code...');
      console.log('Request data:', { 
        mfaCode, 
        tempToken,
        headers: {
          Authorization: `Bearer ${tempToken}`
        }
      });
      
      // Set the temporary token in the request headers
      const res = await api.post('/users/mfa/verify', 
        { mfaCode, tempToken },
        { 
          headers: { 
            Authorization: `Bearer ${tempToken}` 
          }
        }
      );
      
      console.log('MFA verification response:', res.data);

      if (res.data.user && res.data.token) {
        setUser(res.data.user);
        setMfaRequired(false);
        setTempToken(null);
        
        // Store the new token
        localStorage.setItem('token', res.data.token);
        
        // Update the Authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        return { success: true, user: res.data.user };
      } else {
        console.error('Invalid response data:', res.data);
        throw new Error('MFA verification failed: Invalid response data');
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response) {
        throw new Error(error.response.data?.message || 'MFA verification failed');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  };

  const setupMfa = async () => {
    try {
      console.log('Setting up MFA...');
      // Log the request details
      console.log('Making request to:', '/users/setup-mfa');
      console.log('Current user:', user);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const res = await api.post('/users/setup-mfa', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('MFA setup response:', res.data);
      
      if (!res.data) {
        throw new Error('No response data from MFA setup');
      }
      
      return res.data;
    } catch (error) {
      console.error('MFA setup error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to setup MFA');
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to setup MFA');
      }
    }
  };

  const verifyMfaSetup = async (setupCode) => {
    try {
      console.log('Verifying MFA setup...');
      const res = await api.post('/users/verify-mfa-setup', { setupCode });
      console.log('MFA setup verification response:', res.data);
      
      if (res.data.user) {
        setUser(res.data.user);
      }
      
      return res.data;
    } catch (error) {
      console.error('MFA setup verification error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to verify MFA setup');
      } else {
        throw new Error('Failed to verify MFA setup');
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
      console.log('Raw analytics API response data:', res.data);
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
      // Use the dedicated status update endpoint
      const apiUrl = `/events/${id}/status`;
      const requestBody = { status };
      console.log('Status value being sent:', status);
      console.log('Making status update PUT request to:', apiUrl, 'with body:', requestBody);
      const res = await api.put(apiUrl, requestBody); 
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

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Attempting to load user with token...');
      try {
        const res = await api.get('/users/current-user');
        console.log('loadUser successful. Received user data:', res.data); // Log received user object
        // Ensure all user data from backend is set in context
        setUser(res.data);
        setIsAuthenticated(true);
        console.log('User loaded successfully into context:', res.data); // Log loaded user data
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      mfaRequired,
      tempToken,
      login,
      logout,
      verifyMfa,
      setupMfa,
      verifyMfaSetup,
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
      updateEventStatus,
      loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};