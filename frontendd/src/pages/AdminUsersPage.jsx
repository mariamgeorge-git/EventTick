import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api'; // Adjust the import path as necessary

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import UserRow from '../components/admin/UserRow';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../components/admin/ConfirmationDialog';
import UpdateUserRoleModal from '../components/admin/UpdateUserRoleModal';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [openUpdateRoleModal, setOpenUpdateRoleModal] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All'); // State for role filter

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filter whenever users or roleFilter changes
    const applyFilter = () => {
      if (roleFilter === 'All') {
        setFilteredUsers(users);
      } else {
        setFilteredUsers(users.filter(user => user.role === roleFilter.toLowerCase()));
      }
    };

    applyFilter();
  }, [users, roleFilter]); // Depend on users and roleFilter


  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/v1/users', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
      // Initial filter applied in the useEffect above
      // setFilteredUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
      console.error('Error fetching users:', err);
    }
  };

  const handleUpdateRoleClick = (user) => {
    setUserToUpdate(user);
    setOpenUpdateRoleModal(true);
  };

  const handleUpdateRoleModalClose = () => {
    setOpenUpdateRoleModal(false);
    setUserToUpdate(null);
  };

   const handleUpdateRoleConfirm = async (userId, newRole) => {
  try {
    const response = await api.get('/events', {
      params: {  // Send role as a query parameter
        role: newRole.toLowerCase()
      },
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

      // Update users state with the modified user
      setUsers(users.map(user => user._id === userId ? response.data.user : user));
      toast.success('User role updated successfully!');
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      handleUpdateRoleModalClose();
    }
  };

  const handleDeleteClick = (userId) => {
    setUserToDeleteId(userId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setUserToDeleteId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDeleteId) return;

    try {
      await api.delete('/events', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update users state by filtering out the deleted user
      setUsers(users.filter(user => user._id !== userToDeleteId));
      toast.success('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err); // Log full error object to console

      // Attempt to get a more specific error message from the backend response
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete user.';
      
      toast.error(errorMessage);
    } finally {
      handleDeleteDialogClose();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="admin-users-container">
      <div className="header-container">
        <Typography variant="h1" gutterBottom className="admin-users-title">
          User Management
        </Typography>
      </div>

      {/* Role Filter Dropdown */}
      <div className="filter-container">
        <FormControl size="small">
          <InputLabel id="role-filter-label">Filter by Role</InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            value={roleFilter}
            label="Filter by Role"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="All">All Roles</MenuItem>
            <MenuItem value="Standard_user">Standard User</MenuItem>
            <MenuItem value="Event_organizer">Event Organizer</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(filteredUsers || []).map((user) => (
              <UserRow
                key={user._id}
                user={user}
                onUpdateRole={() => handleUpdateRoleClick(user)}
                onDelete={handleDeleteClick}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to delete user ${users.find(u => u._id === userToDeleteId)?.name}?`}
      />

      {userToUpdate && (
        <UpdateUserRoleModal
          open={openUpdateRoleModal}
          onClose={handleUpdateRoleModalClose}
          user={userToUpdate}
          onUpdate={handleUpdateRoleConfirm}
        />
      )}
    </Box>
  );
};

export default AdminUsersPage; 