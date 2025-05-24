import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AuthForms.css'; // Import the new CSS file

const Loginform = () => {  // keep the component name matching filename casing
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Submitting login form...'); // Debug log
      const res = await login(email, password);
      console.log('Login response received:', res); // Debug log
      
      if (res.data.user) {
        toast.success('Login successful!');
        navigate('/dashboard'); // Redirect to dashboard after login
      } else {
        toast.error('Login failed: No user data received');
      }
    } catch (error) {
      console.error('Login error details:', error); // Debug log
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.message || 'Server error occurred';
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

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