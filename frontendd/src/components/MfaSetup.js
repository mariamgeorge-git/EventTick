import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MfaSetup = () => {
  const [setupCode, setSetupCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupInitiated, setSetupInitiated] = useState(false);
  const navigate = useNavigate();

  const initiateSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/users/setup-mfa', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMessage(response.data.message);
      setSetupInitiated(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Error initiating MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/users/verify-mfa-setup', 
        { setupCode },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error verifying MFA setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mfa-setup-container">
      <div className="mfa-setup-card">
        <h2>Setup Two-Factor Authentication</h2>
        <p>Enhance your account security by enabling 2FA</p>

        {!setupInitiated ? (
          <button 
            onClick={initiateSetup}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Start MFA Setup'}
          </button>
        ) : (
          <form onSubmit={verifySetup}>
            <div className="form-group">
              <input
                type="text"
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.toUpperCase())}
                placeholder="Enter setup code from email"
                maxLength="6"
                className="form-control"
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={loading || !setupCode}
            >
              {loading ? 'Verifying...' : 'Verify Setup'}
            </button>
          </form>
        )}
        
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default MfaSetup; 