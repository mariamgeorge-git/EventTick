import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is set, check if user's role is authorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page or home
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized, render child components
  return children;
};
<Route 
  path="/admin/dashboard" 
  element={
    <PrivateRoute allowedRoles={['Admin']}>
      <AdminDashboard />
    </PrivateRoute>
  } 
/>

export default PrivateRoute;