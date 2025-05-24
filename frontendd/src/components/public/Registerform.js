import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AuthForms.css'; // Import the new CSS file

const Registerform = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'standard_user',
    age: '',
  });

  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      // Adjust the URL to your backend registration endpoint
      await axios.post('http://localhost:3001/api/v1/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        age: formData.age,
      });

      // Redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container"> {/* Use the new container class */}
      {/* Wrap form and links in a new div for vertical stacking and centering */}
      <div className="auth-content-wrapper"> {/* Use the new wrapper class */}
        <form onSubmit={handleSubmit} className="auth-form"> {/* Use the new form class */}
          <h2 className="auth-title">Register</h2> {/* Use the new title class */}

          <div className="form-group"> {/* Use the new form group class */}
            <label>Name</label> {/* Label styles handled by CSS */}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              // Inline styles removed, replaced by CSS classes
            />
          </div>

          <div className="form-group"> {/* Use the new form group class */}
            <label>Email</label> {/* Label styles handled by CSS */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              // Inline styles removed, replaced by CSS classes
            />
          </div>

          <div className="form-group"> {/* Use the new form group class */}
            <label>Password</label> {/* Label styles handled by CSS */}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              // Inline styles removed, replaced by CSS classes
            />
          </div>

          <div className="form-group"> {/* Use the new form group class */}
            <label>Confirm Password</label> {/* Label styles handled by CSS */}
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              // Inline styles removed, replaced by CSS classes
            />
          </div>

          <div className="form-group"> {/* Use the new form group class */}
            <label>Age</label> {/* Label styles handled by CSS */}
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              // Inline styles removed, replaced by CSS classes
            />
          </div>

          <div className="form-group"> {/* Use the new form group class */}
            <label>Role</label> {/* Label styles handled by CSS */}
            <select name="role" value={formData.role} onChange={handleChange}
              // Inline styles removed, replaced by CSS classes
            >
              <option value="standard_user">User</option>
              <option value="event_organizer">Organizer</option>
            </select>
          </div>

          {error && <p className="error-message">{error}</p>}{/* Use the new error message class */}

          <button type="submit" className="auth-button"> {/* Use the new button class */}
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registerform;