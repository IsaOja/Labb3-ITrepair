import React from 'react';

interface RemoveTicketProps {
  ticketId: string;
  onRemove: (id: string) => void;
}

const RemoveTicket: React.FC<RemoveTicketProps> = ({ ticketId, onRemove }) => (
  <button data-testid="remove-ticket-btn" onClick={() => onRemove(ticketId)}>
    Remove
  </button>
);

export default RemoveTicket;
