import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import './UpdateProfileForm.css';

const UpdateProfileForm = ({ initialData, onUpdateSuccess, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    age: initialData.age || '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    // Email validation
    const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 18 || age > 100) {
        newErrors.age = 'Age must be between 18 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: name === 'email' ? value.trim() : value
  }));
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      onUpdateSuccess(data.user);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="update-profile-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
          maxLength={50}
          required
        />
        {errors.name && (
          <span className="error-message">{errors.name}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
          required
        />
        {errors.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="age">Age:</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          className={errors.age ? 'error' : ''}
          min="18"
          max="100"
          required
        />
        {errors.age && (
          <span className="error-message">{errors.age}</span>
        )}
      </div>

      {errors.submit && (
        <div className="error-message submit-error">
          {errors.submit}
        </div>
      )}

      <div className="form-buttons">
        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Updating...' : 'Update Profile'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cancel-button"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UpdateProfileForm; 