import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import KanbanTicket from './KanbanTicket';
import type { Ticket } from '../types';

interface KanbanColumnProps {
  status: string;
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
  onEditClick?: (ticket: Ticket) => void;
  userMap?: Record<string, import('../types').User>;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tickets, onTicketClick, onEditClick, userMap }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <Box
      ref={setNodeRef}
      data-testid={`column-${status}`}
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        bgcolor: 'grey.50',
        borderRadius: 4,
        p: 4,
        pt: 4,
        pb: 5,
        minWidth: 260,
        minHeight: '50vh',
        height: 'fit-content',
        border: 2,
        borderColor: 'grey.200',
        boxShadow: 1,
        transition: 'all 0.2s',
        position: 'relative',
        zIndex: 10,
        ...(isOver && { boxShadow: 4, outline: '2px solid #6366f1' })
      }}
    >
      <Typography
        variant="h5"
        sx={{
          textTransform: 'capitalize',
          pb: 1.5,
          mb: 3,
          letterSpacing: 1,
          borderBottom: isOver ? 4 : 2,
          borderColor: '#6366f1',
          fontWeight: 700
        }}
        data-testid={`column-${status}-title`}
      >
        {status}
      </Typography>
      {tickets.length === 0 && (
        <Typography color="text.secondary" fontStyle="italic" mt={5} align="center" fontSize={18}>
          No tickets
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tickets.map((ticket) => (
          <KanbanTicket
            key={ticket._id}
            ticket={ticket}
            onClick={onTicketClick ? () => onTicketClick(ticket) : undefined}
            onEditClick={onEditClick ? () => onEditClick(ticket) : undefined}
            userMap={userMap}
          />
        ))}
      </Box>
    </Box>
  );
};

export default KanbanColumn;
