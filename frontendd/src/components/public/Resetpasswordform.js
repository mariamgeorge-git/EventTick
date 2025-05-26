import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import './AuthForms.css';

const ResetPasswordForm = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { verifyResetCode } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email not found. Please start the forgot password process again.');
      navigate('/forget-password');
      return;
    }

    if (!code.trim()) {
      toast.error('Please enter the verification code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting password reset with:', { email, code, newPassword });
      await verifyResetCode(email, code, newPassword);
      toast.success('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content-wrapper">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-title">Reset Your Password</h2>
          <p className="mfa-instruction">
            Enter the verification code sent to your email and your new password
          </p>
          <p className="mfa-instruction">
            Email: {email || 'N/A'}
          </p>

          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <input
              id="code"
              name="code"
              type="text"
              required
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              required
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;