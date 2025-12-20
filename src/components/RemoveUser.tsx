import React from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface RemoveUserProps {
  userId: string;
  onRemove: (id: string) => void;
}

const RemoveUser: React.FC<RemoveUserProps> = ({ userId, onRemove }) => (
    <IconButton
      data-testid="remove-user-btn"
      color="error"
      onClick={() => onRemove(userId)}
    >
      <DeleteIcon />
    </IconButton>
);

export default RemoveUser;
