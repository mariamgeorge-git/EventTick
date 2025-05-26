import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PhotoCamera, Edit, Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../components/auth/AuthContext';

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
}));

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[6],
  maxWidth: 900,
  margin: 'auto',
}));

const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 160,
  height: 160,
  margin: '0 auto',
  marginBottom: theme.spacing(4),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: '100%',
  height: '100%',
  border: `5px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[5],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const UploadButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows[3],
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  transition: 'background-color 0.3s ease',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '1.1rem',
  },
}));

const ProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profileImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        profileImage: user.profileImage || null,
      });
      setPreviewImage(user.profileImage);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await updateUser(formDataToSend);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Not logged in. Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <ProfileContainer maxWidth="md">
      <ProfilePaper elevation={3}>
        <Grid container spacing={5}>
          {/* Left: Avatar & Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <AvatarWrapper>
                <StyledAvatar
                  src={previewImage || user.profileImage}
                  alt={`${user.firstName} ${user.lastName}`}
                />
                {isEditing && (
                  <UploadButton component="label" aria-label="upload picture">
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />
                    <PhotoCamera />
                  </UploadButton>
                )}
              </AvatarWrapper>
              <Typography variant="h5" gutterBottom fontWeight={700}>
                {user.firstName} {user.lastName}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
                <Chip
                  label={user.role || 'user'}
                  color="primary"
                  size="medium"
                  sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                />
              </Stack>
              {!isEditing && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  fullWidth
                  size="large"
                  sx={{ fontWeight: 600 }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Grid>

          {/* Right: View or Edit Form */}
          <Grid item xs={12} md={8}>
            {!isEditing ? (
              <Box sx={{ pl: { md: 4 } }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Email:</strong> {formData.email}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Phone:</strong> {formData.phone || '-'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Address:</strong> {formData.address || '-'}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  <strong>Bio:</strong>
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {formData.bio || '-'}
                </Typography>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Enter first name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Enter last name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Enter email address"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Enter phone number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Enter address"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Tell us something about yourself"
                    />
                  </Grid>
                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error">{error}</Alert>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setIsEditing(false);
                          setError('');
                          // Reset to user data
                          setFormData({
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            address: user.address || '',
                            bio: user.bio || '',
                            profileImage: user.profileImage || null,
                          });
                          setPreviewImage(user.profileImage);
                        }}
                        size="large"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={loading}
                        size="large"
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </Grid>
        </Grid>
      </ProfilePaper>
    </ProfileContainer>
  );
};

export default ProfilePage;
