import React from 'react';
import { Card, CardContent, Stack, Typography, Chip, Avatar, Button, Paper } from '@mui/material';
import type { Ticket, User } from '../types';

interface TicketListProps {
  tickets: Ticket[];
  userMap: Record<string, User>;
  onSelect: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, userMap, onSelect, onEdit }) => {
  if (tickets.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="h6">No tickets yet. Create one to get started!</Typography>
      </Paper>
    );
  }
  return (
    <Stack spacing={3}>
      {tickets.map(ticket => (
        <Card key={ticket._id} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, borderColor: 'primary.light' } }} onClick={() => onSelect(ticket)}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Chip
                label={ticket.status.replace(/\b\w/g, l => l.toUpperCase())}
                color={ticket.status === 'created' ? 'primary' : ticket.status === 'in progress' ? 'warning' : 'success'}
                variant="outlined"
              />
              <Typography variant="h6" fontWeight={700} flex={1} sx={{ textTransform: 'capitalize' }}>{ticket.title}</Typography>
            </Stack>
            <Typography color="text.secondary" mb={2} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textTransform: 'capitalize' }}>{ticket.description}</Typography>
            <Stack direction="row" spacing={4} mb={2}>
              <Typography variant="body2"><b>Type:</b> <span style={{ textTransform: 'capitalize' }}>{ticket.type}</span></Typography>
              <Typography variant="body2"><b>Priority:</b> <span style={{ color: ticket.priority === 'urgent' ? '#d32f2f' : ticket.priority === 'high' ? '#ed6c02' : undefined, fontWeight: ticket.priority === 'urgent' ? 700 : 500, textTransform: 'capitalize' }}>{ticket.priority}</span></Typography>
            </Stack>
            {ticket.assignedTo && userMap[ticket.assignedTo] ? (
              <Typography variant="body2" color="text.secondary" mb={1} sx={{ textTransform: 'capitalize' }}><b>Assigned to:</b> {userMap[ticket.assignedTo].username}</Typography>
            ) : ticket.assignedTo ? (
              <Typography variant="body2" color="text.secondary" mb={1}><b>Assigned to:</b> Unknown user</Typography>
            ) : null}
            {(Array.isArray(ticket.image) ? ticket.image && ticket.image.length > 0 : !!ticket.image) && (
              <Stack direction="row" spacing={1} mb={2}>
                {Array.isArray(ticket.image) ? (
                  ticket.image.map(img => (
                    <Avatar key={img} variant="rounded" src={img} alt="Attachment" sx={{ width: 48, height: 48, border: '1px solid #eee' }} />
                  ))
                ) : (
                  ticket.image ? (
                    <Avatar variant="rounded" src={ticket.image} alt="Attachment" sx={{ width: 48, height: 48, border: '1px solid #eee' }} />
                  ) : null
                )}
              </Stack>
            )}
            {ticket.status === 'created' && (
              <Button size="small" variant="outlined" color="primary" sx={{ mt: 1 }} onClick={e => { e.stopPropagation(); onEdit(ticket); }}>Edit</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default TicketList;
