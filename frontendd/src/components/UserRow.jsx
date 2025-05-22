import React from 'react';
import { TableCell, TableRow, Button } from '@mui/material';

const UserRow = ({ user, onUpdateRole, onDelete }) => {
  return (
    <TableRow>
      <TableCell>{user._id}</TableCell>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.role}</TableCell>
      {/* Assuming createdAt is also displayed as in AdminUsersPage */}
      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        {/* Action Buttons */}
        {/* These buttons will trigger functions passed down from the parent (AdminUsersPage) */}
        <Button 
          variant="outlined" 
          color="primary" 
          size="small" 
          onClick={() => onUpdateRole(user._id, user.role)}
          style={{ marginRight: '8px' }}
        >
          Update Role
        </Button>
        <Button 
          variant="outlined" 
          color="error" 
          size="small" 
          onClick={() => onDelete(user._id)}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UserRow; 