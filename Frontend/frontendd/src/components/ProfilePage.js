import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UpdateProfileForm from './UpdateProfileForm';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data when component mounts
    if (currentUser) {
      setUserData({
        email: currentUser.email,
        displayName: currentUser.displayName || '',
        role: currentUser.role || 'user',
        // Add other user fields as needed
      });
    }
  }, [currentUser]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdateSuccess = (updatedData) => {
    setUserData(updatedData);
    setIsEditing(false);
  };

  if (!userData) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      
      {!isEditing ? (
        <div className="profile-info">
          <div className="profile-field">
            <label>Email:</label>
            <span>{userData.email}</span>
          </div>
          <div className="profile-field">
            <label>Name:</label>
            <span>{userData.displayName}</span>
          </div>
          <div className="profile-field">
            <label>Role:</label>
            <span>{userData.role}</span>
          </div>
          <button 
            className="edit-button"
            onClick={handleEditClick}
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