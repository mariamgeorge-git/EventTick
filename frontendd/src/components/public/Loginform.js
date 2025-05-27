import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AuthForms.css'; // Import the new CSS file

const Loginform = () => {  // keep the component name matching filename casing
  const { login, verifyMfa } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Submitting login form...');
      const res = await login(email, password);
      console.log('Login handler received response:', res);

      if (res && res.success) {
        console.log('Login successful, redirecting...');
        navigate('/dashboard');
      } else if (res && res.mfaRequired) {
        console.log('MFA required, showing MFA input...');
        setShowMfaInput(true);
        setTempToken(res.tempToken);
        toast.info('Please enter the verification code sent to your email');
      } else {
        console.error('Login failed with unexpected response structure or no response.', res);
        toast.error(res?.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login submission error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Submitting MFA verification...');
      const res = await verifyMfa(mfaCode);
      console.log('MFA verification response:', res);
      
      if (res.success) {
        console.log('MFA verification successful, redirecting...');
        toast.success('MFA verification successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      toast.error(error.message || 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (showMfaInput) {
    return (
      <div className="auth-container">
        <div className="auth-content-wrapper">
          <form onSubmit={handleMfaSubmit} className="auth-form">
            <h2 className="auth-title">Two-Factor Authentication</h2>
            <p className="mfa-instruction">
              For added security, please enter the verification code sent to your email address.
            </p>
            
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter verification code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.toUpperCase())}
                maxLength="6"
                required
                disabled={loading}
                className="form-control"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !mfaCode}
              className="auth-button"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <p className="mfa-help-text">
              Didn't receive the code? Check your spam folder or contact support.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-content-wrapper">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-title">Login</h2>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account?{' '}
          <Link to="/register">
            Register here
          </Link>
        </p>
        <p className="auth-link">
          Forgot your password?{' '}
          <Link to="/forget-password">
            Reset it here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Loginform;