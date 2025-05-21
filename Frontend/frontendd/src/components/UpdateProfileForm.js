import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UpdateProfileForm.css';

const UpdateProfileForm = ({ initialData, onUpdateSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: initialData.displayName || '',
    // Add other editable fields here
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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
      // Call your backend API to update the user profile
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      onUpdateSuccess(updatedData);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="update-profile-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="displayName">Name:</label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className={errors.displayName ? 'error' : ''}
        />
        {errors.displayName && (
          <span className="error-message">{errors.displayName}</span>
        )}
      </div>

      {/* Add other form fields here */}

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