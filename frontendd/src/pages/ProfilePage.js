import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/auth/AuthContext';
import UpdateProfileForm from '../components/public/UpdateProfileForm';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, setupMfa, verifyMfaSetup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
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
          mfaEnabled: user.mfaEnabled || false
        });
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error loading user data:', err);
      }
    } else {
      setError('No user data available');
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdateSuccess = (updatedData) => {
    setUserData(updatedData);
    setIsEditing(false);
  };

  const handleSetupMfa = async () => {
    setLoading(true);
    try {
      const response = await setupMfa();
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
      const response = await verifyMfaSetup(setupCode);
      toast.success('MFA setup successful!');
      setShowMfaSetup(false);
      setUserData(prev => ({
        ...prev,
        mfaEnabled: true
      }));
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
      <div className="profile-container">
        <div className="profile-loading">Loading...</div>
      </div>
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
          <div className="profile-field">
            <label>Two-Factor Authentication:</label>
            <span>{userData.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          
          <div className="profile-actions">
            <button 
              className="edit-button"
              onClick={handleEditClick}
            >
              Edit Profile
            </button>
            
            {!userData.mfaEnabled && !showMfaSetup && (
              <button 
                className="mfa-button"
                onClick={handleSetupMfa}
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
              </button>
            )}
          </div>

          {showMfaSetup && (
            <div className="mfa-setup-section">
              <h3>Set Up Two-Factor Authentication</h3>
              <p className="mfa-instruction">
                Please enter the verification code sent to your email to complete the setup.
              </p>
              <form onSubmit={handleVerifyMfa}>
                <div className="form-group">
                  <input
                    type="text"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.toUpperCase())}
                    placeholder="Enter verification code"
                    maxLength="6"
                    required
                    disabled={loading}
                    className="form-control"
                  />
                </div>
                <button
                  type="submit"
                  className="verify-button"
                  disabled={loading || !setupCode}
                >
                  {loading ? 'Verifying...' : 'Verify and Enable'}
                </button>
              </form>
            </div>
          )}
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