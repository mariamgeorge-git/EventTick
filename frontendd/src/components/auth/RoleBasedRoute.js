import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Assuming AuthContext is in the same directory

const RoleBasedRoute = ({ element, requiredRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // If still loading, you might want to render a loading indicator
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in the requiredRoles array
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    // If role is not authorized, redirect to a forbidden page or home
    // You might want a specific 403 Forbidden page
    return <Navigate to="/" replace />; // Redirect to home for now
  }

  // If authorized, render the element
  return element;
};

export default RoleBasedRoute; 