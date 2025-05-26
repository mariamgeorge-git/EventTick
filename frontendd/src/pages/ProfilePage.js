import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Alert,
} from '@mui/material';
import { AuthContext } from '../components/auth/AuthContext';
import UpdateProfileForm from '../components/public/UpdateProfileForm';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      try {
        setUserData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'standard_user',
          age: user.age || '',
          isActive: user.isActive
        });
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error loading user data:', err);
      }
    } else {
      setError('No user data available');
    }
  }, [user]);

  const handleUpdateSuccess = (updatedData) => {
    setUserData(updatedData);
    setIsEditing(false);
  };

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Not logged in. Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      
      {!isEditing ? (
        <div className="profile-info">
          <div className="profile-field">
            <label>Name:</label>
            <span>{userData.name}</span>
          </div>
          <div className="profile-field">
            <label>Email:</label>
            <span>{userData.email}</span>
          </div>
          <div className="profile-field">
            <label>Role:</label>
            <span>{userData.role}</span>
          </div>
          <div className="profile-field">
            <label>Age:</label>
            <span>{userData.age}</span>
          </div>
          <div className="profile-field">
            <label>Status:</label>
            <span>{userData.isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <button 
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <UpdateProfileForm
          initialData={userData}
          onUpdateSuccess={handleUpdateSuccess}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage; 