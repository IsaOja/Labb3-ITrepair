import React from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface RemoveTicketProps {
  ticketId: string;
  onRemove: (id: string) => void;
}

const RemoveTicket: React.FC<RemoveTicketProps> = ({ ticketId, onRemove }) => (
  <IconButton
    data-testid="remove-ticket-btn"
    color="error"
    onClick={() => onRemove(ticketId)}
  >
    <DeleteIcon />
  </IconButton>
);

export default RemoveTicket;
