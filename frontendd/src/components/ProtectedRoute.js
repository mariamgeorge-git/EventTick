import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const ProtectedRoute = ({ children, requireMfa = true }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }

    // If MFA is required and not verified, redirect to verification
    if (requireMfa && !decoded.user.mfaVerified && decoded.tempAuth) {
      return <Navigate to="/mfa-verification" replace />;
    }
    
    return children;
  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute; 