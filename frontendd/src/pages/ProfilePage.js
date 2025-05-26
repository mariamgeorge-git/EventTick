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

  // MFA state
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [setupCode, setSetupCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        setUserData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'standard_user',
          age: user.age || '',
          isActive: user.isActive,
          mfaEnabled: user.mfaEnabled // add this if present in user object
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

  // MFA handlers
  const handleSetupMfa = async () => {
    setLoading(true);
    try {
      await setupMfa();
      setShowMfaSetup(true);
      toast.info('Please check your email for the MFA setup code');
    } catch (error) {
      toast.error(error.message || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyMfaSetup(setupCode);
      toast.success('MFA setup successful!');
      setShowMfaSetup(false);
      // Optionally update userData to reflect MFA enabled
      setUserData((prev) => ({ ...prev, mfaEnabled: true }));
    } catch (error) {
      toast.error(error.message || 'Failed to verify MFA setup');
    } finally {
      setLoading(false);
    }
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
          {/* MFA Section */}
          <div className="profile-field">
            <label>Two-Factor Authentication:</label>
            <span>{userData.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          {!userData.mfaEnabled && !showMfaSetup && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleSetupMfa}
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
            </Button>
          )}
          {showMfaSetup && (
            <form onSubmit={handleVerifyMfa} style={{ marginTop: 8 }}>
              <TextField
                value={setupCode}
                onChange={e => setSetupCode(e.target.value.toUpperCase())}
                label="Verification Code"
                required
                size="small"
                sx={{ mr: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !setupCode}
              >
                {loading ? 'Verifying...' : 'Verify and Enable'}
              </Button>
            </form>
          )}
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
