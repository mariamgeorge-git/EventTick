import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { toast } from 'react-toastify';

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
    <div >
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        margin: 'auto'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>
          Reset Your Password
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1rem' }}>
          Enter the verification code sent to your email and your new password
        </p>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem' }}>
          Email: {email || 'N/A'}
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="code" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Verification Code</label>
          <input
            id="code"
            name="code"
            type="text"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="new-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>New Password</label>
          <input
            id="new-password"
            name="new-password"
            type="password"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="confirm-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Confirm Password</label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;