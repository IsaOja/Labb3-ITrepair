import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Ticket } from '../types';
import { Box, Paper, Typography, IconButton } from '@mui/material';

interface KanbanTicketProps {
  ticket: Ticket;
  onClick?: () => void;
  onEditClick?: () => void;
  userMap?: Record<string, import('../types').User>;
}

const KanbanTicket: React.FC<KanbanTicketProps> = ({ ticket, onClick, onEditClick, userMap }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket._id });
  return (
    <Paper
      ref={setNodeRef}
      elevation={isDragging ? 8 : 3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        bgcolor: isDragging ? 'indigo.50' : 'background.paper',
        borderRadius: 3,
        boxShadow: isDragging ? 8 : 3,
        border: isDragging ? '2px solid #6366f1' : '1px solid #e0e0e0',
        py: 1.5,
        px: 3,
        opacity: isDragging ? 0.5 : 1,
        mb: 2,
        transition: 'all 0.2s',
        cursor: 'pointer',
        width: '100%',
        minWidth: 0,
        wordBreak: 'break-word',
      }}
      {...attributes}
      onClick={onClick}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }} data-testid={`ticket-${ticket._id}`}>
        <Box
          {...listeners}
          sx={{
            cursor: 'grab',
            fontSize: 28,
            color: 'primary.main',
            p: 1,
            borderRadius: 2,
            bgcolor: isDragging ? 'indigo.100' : 'indigo.50',
            border: isDragging ? '2px solid #6366f1' : '2px solid #b3b8f8',
            boxShadow: 1,
            userSelect: 'none',
            transition: 'all 0.2s',
            mr: 2,
          }}
          title="Drag to move"
          aria-label="Drag handle"
        >
          ≡
        </Box>

        <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ flex: 1, textAlign: 'center', mx: 1, wordBreak: 'break-word', textTransform: 'capitalize' }} data-testid={`ticket-${ticket._id}-title`}>{ticket.title}</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', textTransform: 'capitalize' }} data-testid={`ticket-${ticket._id}-assigned`}>
            {ticket.assignedTo != null
              ? userMap && userMap[ticket.assignedTo]
                ? userMap[ticket.assignedTo].username
                : 'Unknown user'
              : 'Unassigned'}
          </Typography>
          <Typography variant="body2" sx={{ color: ticket.priority === 'urgent' ? '#d32f2f' : ticket.priority === 'high' ? '#ed6c02' : undefined, fontWeight: ticket.priority === 'urgent' ? 700 : 500, textTransform: 'capitalize' }} data-testid={`ticket-${ticket._id}-priority`}>{ticket.priority}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 1 }}>
        {onEditClick && (
          <IconButton
            aria-label="Edit ticket"
            onClick={e => {
              e.stopPropagation();
              onEditClick();
            }}
            size="small"
            sx={{ alignSelf: 'flex-end' }}
            data-testid={`ticket-${ticket._id}-edit`}
          >
            <span role="img" aria-label="edit">✏️</span>
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};

export default KanbanTicket;
