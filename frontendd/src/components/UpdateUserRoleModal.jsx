import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const UpdateUserRoleModal = ({
  open,
  onClose,
  user,
  onUpdate
}) => {
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleUpdateClick = () => {
    if (user && selectedRole) {
      onUpdate(user._id, selectedRole);
    }
    // The modal will be closed by the onUpdate handler in the parent component
  };

  const roles = ['admin', 'event_organizer', 'standard_user'];

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Role for {user?.name}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            id="role-select"
            value={selectedRole}
            label="Role"
            onChange={handleRoleChange}
          >
            {roles.map((roleOption) => (
              <MenuItem key={roleOption} value={roleOption}>
                {roleOption.replace('_', ' ').toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleUpdateClick} color="primary" disabled={!selectedRole || selectedRole === user?.role}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUserRoleModal; 