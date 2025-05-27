import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Assuming AuthContext is in the same directory

const RoleBasedRoute = ({ element, requiredRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // Check if user's role is in the requiredRoles array
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    // If role is not authorized, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // If authorized, render the element
  return element;
};

export default RoleBasedRoute; 