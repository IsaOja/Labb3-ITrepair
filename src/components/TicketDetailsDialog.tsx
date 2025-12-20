import React from 'react';
import { Dialog, DialogContent, IconButton, Box, Stack, Chip, Typography, Avatar, Button } from '@mui/material';
import CommentsSection from './CommentsSection';
import CloseIcon from '@mui/icons-material/Close';
import type { Ticket, User } from '../types';

interface Comment {
  _id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface TicketDetailsDialogProps {
  open: boolean;
  ticket: Ticket | null;
  user: User;
  userMap: Record<string, User>;
  comments: Comment[];
  commentInput: string;
  commentLoading: boolean;
  zoomedImage: string | null;
  onClose: () => void;
  onEdit: () => void;
  onCommentInput: (val: string) => void;
  onSendComment: () => void;
  onZoomImage: (img: string | null) => void;
}

const TicketDetailsDialog: React.FC<TicketDetailsDialogProps> = ({
  open, ticket, user, userMap, comments, commentInput, commentLoading, zoomedImage,
  onClose, onEdit, onCommentInput, onSendComment, onZoomImage
}) => (
  <>
    <Dialog open={open && !!ticket} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 4, position: 'relative', maxHeight: '90vh' }}>
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.500' }}>
          <CloseIcon fontSize="large" />
        </IconButton>
        {ticket && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Chip
                label={ticket.status.replace(/\b\w/g, l => l.toUpperCase())}
                color={ticket.status === 'created' ? 'primary' : ticket.status === 'in progress' ? 'warning' : 'success'}
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: 14, px: 2, py: 0.5 }}
              />
              <Typography variant="h5" fontWeight={700} sx={{ textTransform: 'capitalize' }} data-testid="ticket-popup-title">{ticket.title}</Typography>
            </Stack>
            <Typography color="text.secondary" mb={3} sx={{ borderBottom: '1px solid #eee', pb: 2, textTransform: 'capitalize' }}><b>Description:</b> {ticket.description}</Typography>
            <Stack direction="row" spacing={4} mb={2}>
              <Typography variant="body2" color="primary" fontWeight={600}>Type: <Typography component="span" color="text.primary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{ticket.type}</Typography></Typography>
              <Typography variant="body2" color="error" fontWeight={600}>Priority: <Typography component="span" color="text.primary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{ticket.priority}</Typography></Typography>
              {ticket.assignedTo && userMap[ticket.assignedTo] && (
                <Typography variant="body2" color="secondary" fontWeight={600}>
                  Assigned to: <Typography component="span" color="text.primary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{userMap[ticket.assignedTo].username}</Typography>
                </Typography>
              )}
            </Stack>
            <Stack direction="row" spacing={2} flexWrap="wrap" mb={3}>
              {Array.isArray(ticket.image) ? ticket.image.map((img, idx) => (
                <Avatar key={img} variant="rounded" src={img} alt={`Ticket image ${idx + 1}`} sx={{ width: 90, height: 90, border: '2px solid #e5e7eb', boxShadow: 1, cursor: 'pointer' }} onClick={() => onZoomImage(img)} />
              )) : ticket.image ? (
                <Avatar variant="rounded" src={ticket.image} alt="Ticket image" sx={{ width: 90, height: 90, border: '2px solid #e5e7eb', boxShadow: 1, cursor: 'pointer' }} onClick={() => onZoomImage(ticket.image ?? null)} />
              ) : null}
            </Stack>
            <CommentsSection
              comments={comments}
              userName={user.username}
              input={commentInput}
              loading={commentLoading}
              onInput={onCommentInput}
              onSend={onSendComment}
            />
            {ticket.status === 'created' && (
              <Button variant="contained" color="primary" sx={{ mt: 2, fontWeight: 600 }} onClick={onEdit}>Edit</Button>
            )}
            <Button variant="outlined" color="secondary" sx={{ mt: 2, fontWeight: 600, ml: 2 }} onClick={onClose}>Close</Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
    {zoomedImage && (
      <Dialog open onClose={() => onZoomImage(null)} maxWidth={false} PaperProps={{ sx: { background: 'rgba(0,0,0,0.9)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}>
        <Box onClick={() => onZoomImage(null)} sx={{ cursor: 'zoom-out', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', p: 4 }}>
          <Box component="img" src={zoomedImage || ''} alt="Full size" sx={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 3, boxShadow: 8 }} />
        </Box>
      </Dialog>
    )}
  </>
);

export default TicketDetailsDialog;
