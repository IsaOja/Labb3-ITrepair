import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Stack, Typography, Button, IconButton, Avatar, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Ticket, User } from '../types';
import EditTicketForm from './EditTicketForm';
import CommentsSection from './CommentsSection';

interface Comment {
  _id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface TicketDialogProps {
  ticket: Ticket | null;
  open: boolean;
  user: User;
  userMap: Record<string, User>;
  editMode: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: (updated: Ticket, updatedImages: (File | null)[], removedIndexes: number[]) => Promise<void>;
  onCancelEdit: () => void;
  onRemove?: (id: string) => void;
}

const TicketDialog: React.FC<TicketDialogProps> = ({ ticket, open, user, userMap, editMode, onClose, onEdit, onSave, onCancelEdit, onRemove }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (editMode || !ticket) {
      setComments([]);
      return;
    }
    let ignore = false;
    const fetchComments = () => {
      fetch(`/api/tickets/${ticket._id}/comments`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (!ignore) setComments(Array.isArray(data) ? data : []);
        })
        .catch(() => { if (!ignore) setComments([]); });
    };
    fetchComments();
    const interval = setInterval(fetchComments, 2000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [ticket, editMode, user.token]);

  if (!ticket) return null;

  return (
    <>
      <Dialog data-testid="staff-ticket-dialog" open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 4, position: 'relative', maxHeight: '90vh' }}>
          <IconButton data-testid="staff-popup-close" aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.500' }}>
            <CloseIcon fontSize="large" />
          </IconButton>
          {editMode ? (
            <EditTicketForm
              ticket={ticket}
              currentUser={user}
              onSave={onSave}
              onCancel={onCancelEdit}
              onRemove={onRemove}
            />
          ) : (
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Chip
                  label={ticket.status.replace(/\b\w/g, l => l.toUpperCase())}
                  color={ticket.status === 'created' ? 'primary' : ticket.status === 'in progress' ? 'warning' : 'success'}
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: 14, px: 2, py: 0.5 }}
                />
                <Typography data-testid="staff-popup-title" variant="h5" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{ticket.title}</Typography>
              </Stack>
              <Typography color="text.secondary" mb={3} sx={{ borderBottom: '1px solid #eee', pb: 2 }}><b>Description:</b> {ticket.description}</Typography>
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
                  <Avatar key={img} variant="rounded" src={img} alt={`Ticket image ${idx + 1}`} sx={{ width: 90, height: 90, border: '2px solid #e5e7eb', boxShadow: 1, cursor: 'pointer' }} onClick={() => setZoomedImage(img)} />
                )) : ticket.image ? (
                  <Avatar variant="rounded" src={ticket.image} alt="Ticket image" sx={{ width: 90, height: 90, border: '2px solid #e5e7eb', boxShadow: 1, cursor: 'pointer' }} onClick={() => setZoomedImage(ticket.image ?? null)} />
                ) : null}
              </Stack>
              <CommentsSection
                comments={comments}
                userName={user.username}
                input={commentInput}
                loading={commentLoading}
                onInput={setCommentInput}
                onSend={async () => {
                  setCommentLoading(true);
                  const res = await fetch(`/api/tickets/${ticket._id}/comments`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ text: commentInput }),
                  });
                  if (res.ok) {
                    const newComment = await res.json();
                    setComments(prev => [...prev, newComment]);
                    setCommentInput('');
                  }
                  setCommentLoading(false);
                }}
              />
              <Button data-testid="staff-popup-edit" variant="contained" color="primary" sx={{ mt: 2, fontWeight: 600 }} onClick={onEdit}>Edit</Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {zoomedImage && (
        <Dialog open onClose={() => setZoomedImage(null)} maxWidth={false} PaperProps={{ sx: { background: 'rgba(0,0,0,0.9)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}>
          <Box onClick={() => setZoomedImage(null)} sx={{ cursor: 'zoom-out', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', p: 4 }}>
            <Box component="img" src={zoomedImage || ''} alt="Zoomed ticket attachment" sx={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 3, boxShadow: 8 }} />
          </Box>
        </Dialog>
      )}
    </>
  );
};

export default TicketDialog;
