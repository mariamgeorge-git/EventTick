import React from 'react';
import { TableCell, TableRow, Button } from '@mui/material';
import './UserRow.css'; // Import the CSS file

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
          className="user-action-button update-role" // Apply CSS classes
          size="small" 
          onClick={() => onUpdateRole(user._id, user.role)}
          style={{ marginRight: '8px' }}
          // Removed variant and color props
        >
          Update Role
        </Button>
        <Button 
          className="user-action-button delete" // Apply CSS classes
          size="small" 
          onClick={() => onDelete(user._id)}
          // Removed variant and color props
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UserRow; 