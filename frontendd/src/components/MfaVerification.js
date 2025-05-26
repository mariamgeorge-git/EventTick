import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MfaVerification = ({ tempToken, onVerificationSuccess }) => {
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/verify-mfa', {
        mfaCode,
        tempToken
      });

      // Store the final token and user data
      localStorage.setItem('token', response.data.token);
      
      if (onVerificationSuccess) {
        onVerificationSuccess(response.data);
      }
      
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mfa-verification-container">
      <div className="mfa-verification-card">
        <h2>Two-Factor Authentication</h2>
        <p>Please enter the verification code sent to your email</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.toUpperCase())}
              placeholder="Enter verification code"
              maxLength="6"
              className="form-control"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !mfaCode}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
        
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default MfaVerification; 