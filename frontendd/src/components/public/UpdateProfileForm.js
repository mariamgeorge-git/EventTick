import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../components/auth/AuthContext';
import { Avatar, Button, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import './UpdateProfileForm.css'; // Import the CSS file

const UpdateProfileForm = ({ initialData = {}, onUpdateSuccess, onCancel }) => {
  const { updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with initialData when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        age: initialData.age ? String(initialData.age) : '',
      });
      if (initialData.profileImage) {
        setPreviewUrl(initialData.profileImage);
      }
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    else if (formData.name.length > 50) newErrors.name = 'Name cannot exceed 50 characters';

    const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailPattern.test(formData.email.trim()))
      newErrors.email = 'Please enter a valid email';

    if (!formData.age.trim()) newErrors.age = 'Age is required';
    else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        newErrors.age = 'Age must be a number between 18 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSubmitError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please upload an image file');
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('age', Number(formData.age.trim()));
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const updatedUser = await updateUser(formDataToSend);
      onUpdateSuccess(updatedUser);
    } catch (error) {
      setSubmitError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="update-profile-form">
      <div className="profile-image-section">
        <Avatar
          src={previewUrl || initialData.profileImage}
          alt={formData.name}
          sx={{ width: 100, height: 100, mb: 2 }}
        />
        <input
          accept="image/*"
          type="file"
          id="profile-image-input"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="profile-image-input">
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="span"
            sx={{ mt: 1 }}
          >
            <PhotoCamera />
          </IconButton>
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          maxLength={50}
          disabled={isSubmitting}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <p className="error-message">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="age">Age:</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          min="18"
          max="100"
          disabled={isSubmitting}
          className={errors.age ? 'error' : ''}
        />
        {errors.age && <p className="error-message">{errors.age}</p>}
      </div>

      {submitError && <p className="submit-error">{submitError}</p>}

      <div className="form-buttons">
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Updating...' : 'Update Profile'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="cancel-button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UpdateProfileForm;