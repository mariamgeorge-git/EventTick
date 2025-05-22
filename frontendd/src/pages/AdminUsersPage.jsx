import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  MenuItem
} from '@mui/material';
import UserRow from '../components/admin/UserRow';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../components/admin/ConfirmationDialog';
import UpdateUserRoleModal from '../components/admin/UpdateUserRoleModal';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [openUpdateRoleModal, setOpenUpdateRoleModal] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/v1/users', {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
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
      const response = await axios.put(`http://localhost:3001/api/v1/users/${userId}`, 
        { role: newRole.toLowerCase() },
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

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
      await axios.delete(`http://localhost:3001/api/v1/users/${userToDeleteId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setUsers(users.filter(user => user._id !== userToDeleteId));
      toast.success('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user.');
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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
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
            {users.map((user) => (
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