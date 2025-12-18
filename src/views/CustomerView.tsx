import React, { useState, useEffect } from 'react';
import type { Ticket, User } from '../types';
import { Box, Paper, Typography, Button, Stack, Dialog, DialogContent, Chip, Avatar, IconButton, Card, CardContent, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditTicketForm from '../components/EditTicketForm';

interface CreateTicketFormProps {
  user: User;
  onCreate: (form: { title: string; description: string; type: string; priority: string }, images: (File | null)[]) => void;
  onCancel: () => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onCreate, onCancel }) => {
  const [form, setForm] = useState({ title: '', description: '', type: 'hardware', priority: 'low' });
  const [images, setImages] = useState<(File | null)[]>([]);

  return (
    <Box component="form" onSubmit={e => { e.preventDefault(); onCreate(form, images); }} sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom data-testid="create-ticket-title">Create Ticket</Typography>
      <TextField
        label="Title"
        name="title"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        required
        fullWidth
      />
      <TextField
        label="Description"
        name="description"
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        required
        multiline
        minRows={3}
        fullWidth
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            name="type"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            <MenuItem value="hardware">Hardware</MenuItem>
            <MenuItem value="software">Software</MenuItem>
            <MenuItem value="network">Network</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            label="Priority"
            name="priority"
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box>
        <Typography fontWeight={600} mb={1}>Images (max 3)</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {images.map((file, idx) => (
            <Box key={idx} sx={{ position: 'relative' }}>
              {file && (
                <Avatar variant="rounded" src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} sx={{ width: 64, height: 64, border: '1px solid #ccc' }} />
              )}
              <IconButton size="small" sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }} onClick={() => setImages(images.filter((_, i) => i !== idx))}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          {images.length < 3 && (
            <Button variant="outlined" component="label" sx={{ width: 64, height: 64, borderRadius: 2, borderStyle: 'dashed' }}>
              +
              <input type="file" accept="image/*" hidden onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setImages([...images, e.target.files[0]]);
                }
              }} />
            </Button>
          )}
        </Stack>
      </Box>
      <Stack direction="row" spacing={2} mt={2}>
        <Button type="submit" variant="contained" color="primary" fullWidth data-testid="create-ticket-submit">Create Ticket</Button>
        <Button type="button" variant="outlined" color="secondary" fullWidth onClick={onCancel}>Cancel</Button>
      </Stack>
    </Box>
  );
};
interface CustomerViewProps {
  user: User;
}

type DialogMode = 'none' | 'create' | 'view' | 'edit';
const CustomerView: React.FC<CustomerViewProps> = ({ user }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>('none');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [comments, setComments] = useState<Array<{_id: string, author: string, text: string, createdAt: string}>>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (dialogMode !== 'view' || !selectedTicket) {
      setComments([]);
      return;
    }
    let ignore = false;
    const fetchComments = () => {
      fetch(`/api/tickets/${selectedTicket._id}/comments`, {
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
  }, [selectedTicket, dialogMode, user.token]);

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      const assignedIds = Array.from(new Set(tickets.map(t => t.assignedTo).filter(Boolean)));
      const map: Record<string, User> = {};
      await Promise.all(assignedIds.map(async (id) => {
        try {
          const res = await fetch(`/api/users/${id}`, {
            headers: { 'Authorization': `Bearer ${user.token}` },
          });
          if (res.ok) {
            const u = await res.json();
            if (u && u._id) map[u._id] = u;
          }
        } catch {}
      }));
      setUserMap(map);
    };
    if (tickets.length > 0) fetchAssignedUsers();
    else setUserMap({});
  }, [tickets, user.token]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/tickets', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      } catch {
        setTickets([]);
      }
    };
    fetchTickets();
  }, [user._id, user.token]);

  return (
    <React.Fragment>
      <Box>
        <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" fontWeight={700}>My Tickets</Typography>
          <Button variant="contained" color="primary" onClick={() => { setDialogMode('create'); setSelectedTicket(null); }} data-testid="create-ticket-button">+ Create Ticket</Button>
        </Box>
        <Dialog open={dialogMode === 'create'} onClose={() => setDialogMode('none')} maxWidth="sm" fullWidth>
          <DialogContent sx={{ p: 0 }}>
                <CreateTicketForm
              user={user}
              onCreate={async (form, images) => {
                const formData = new FormData();
                formData.append('title', form.title);
                formData.append('description', form.description);
                formData.append('type', form.type);
                formData.append('priority', form.priority);
                formData.append('status', 'created');
                formData.append('user', user._id);
                images.forEach(img => { if (img) formData.append('image', img); });
                const res = await fetch('/api/tickets', {
                  method: 'POST',
                  body: formData,
                });
                  if (res.ok) {
                    const ticket = await res.json();
                    setTickets(t => [ticket, ...t]);
                    setDialogMode('none');
                  }
              }}
              onCancel={() => setDialogMode('none')}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={dialogMode === 'edit' && !!selectedTicket} onClose={() => { setDialogMode('none'); setSelectedTicket(null); }} maxWidth="sm" fullWidth>
          <DialogContent sx={{ p: 0 }}>
            {selectedTicket && (
              <EditTicketForm
                ticket={selectedTicket}
                currentUser={user}
                onSave={async (updated, updatedImages, removedImageIndexes) => {
                  const formData = new FormData();
                  formData.append('title', updated.title);
                  formData.append('description', updated.description);
                  formData.append('type', updated.type);
                  formData.append('priority', updated.priority);
                  updatedImages.forEach(img => { if (img) formData.append('image', img); });
                  formData.append('removedImages', JSON.stringify(removedImageIndexes));
                  const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
                    method: 'PUT',
                    body: formData,
                  });
                  if (res.ok) {
                    const newTicket = await res.json();
                    setTickets(tickets => tickets.map(t => t._id === newTicket._id ? newTicket : t));
                    setSelectedTicket(newTicket);
                    setDialogMode('view');
                  }
                }}
                onCancel={() => {
                  setDialogMode('none'); setSelectedTicket(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={dialogMode === 'view' && !!selectedTicket} onClose={() => { setDialogMode('none'); setSelectedTicket(null); }} maxWidth="md" fullWidth>
          <DialogContent sx={{ p: 4, position: 'relative', maxHeight: '90vh' }}>
            <IconButton aria-label="close" onClick={() => { setDialogMode('none'); setSelectedTicket(null); }} sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.500' }}>
              <CloseIcon fontSize="large" />
            </IconButton>
            {selectedTicket && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Chip
                    label={selectedTicket.status.replace(/\b\w/g, l => l.toUpperCase())}
                    color={selectedTicket.status === 'created' ? 'primary' : selectedTicket.status === 'in progress' ? 'warning' : 'success'}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: 14, px: 2, py: 0.5 }}
                  />
                  <Typography variant="h5" fontWeight={700} sx={{ textTransform: 'capitalize' }} data-testid="ticket-popup-title">{selectedTicket.title}</Typography>
                </Stack>
                <Typography color="text.secondary" mb={3} sx={{ borderBottom: '1px solid #eee', pb: 2, textTransform: 'capitalize' }}><b>Description:</b> {selectedTicket.description}</Typography>
                <Stack direction="row" spacing={4} mb={2}>
                  <Typography variant="body2" color="primary" fontWeight={600}>Type: <Typography component="span" color="text.primary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{selectedTicket.type}</Typography></Typography>
                  <Typography variant="body2" color="error" fontWeight={600}>Priority: <Typography component="span" color="text.primary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{selectedTicket.priority}</Typography></Typography>
                  {selectedTicket.assignedTo && userMap[selectedTicket.assignedTo] && (
                    <Typography variant="body2" color="secondary" fontWeight={600}>
                      Assigned to: <Typography component="span" color="text.primary" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{userMap[selectedTicket.assignedTo].username}</Typography>
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row" spacing={2} flexWrap="wrap" mb={3}>
                  {Array.isArray(selectedTicket.image) ? selectedTicket.image.map((img, idx) => (
                    <Avatar key={img} variant="rounded" src={img} alt={`Ticket image ${idx + 1}`} sx={{ width: 90, height: 90, border: '2px solid #e5e7eb', boxShadow: 1, cursor: 'pointer' }} onClick={() => setZoomedImage(img)} />
                  )) : selectedTicket.image ? (
                    <Avatar variant="rounded" src={selectedTicket.image} alt="Ticket image" sx={{ width: 90, height: 90, border: '2px solid #e5e7eb', boxShadow: 1, cursor: 'pointer' }} onClick={() => setZoomedImage(selectedTicket.image ?? null)} />
                  ) : null}
                </Stack>
                  <Box mb={3}>
                  <Typography variant="h6" fontWeight={700} mb={1}>Comments</Typography>
                  <Stack spacing={1} mb={2} sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: '#f9f9fa', p: 2, borderRadius: 2, border: '1px solid #eee' }}>
                    {comments.length === 0 && <Typography color="text.secondary">No comments yet.</Typography>}
                    {comments.map(comment => (
                      <Box key={comment._id} sx={{ bgcolor: comment.author === user.username ? '#e3f2fd' : '#fff', p: 1.2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{comment.author} <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 8 }}>{new Date(comment.createdAt).toLocaleString()}</span></Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{comment.text}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      size="small"
                      placeholder="Write a comment..."
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={4}
                      disabled={commentLoading}
                        inputProps={{ 'data-testid': 'customer-comment-input' }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                        disabled={!commentInput.trim() || commentLoading}
                        data-testid="customer-comment-send"
                      onClick={async () => {
                        if (!selectedTicket) return;
                        setCommentLoading(true);
                        const res = await fetch(`/api/tickets/${selectedTicket._id}/comments`, {
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
                      sx={{ minWidth: 90 }}
                    >Send</Button>
                  </Stack>
                </Box>
                {selectedTicket.status === 'created' && (
                  <Button variant="contained" color="primary" sx={{ mt: 2, fontWeight: 600 }} onClick={() => setDialogMode('edit')}>Edit</Button>
                )}
                <Button variant="outlined" color="secondary" sx={{ mt: 2, fontWeight: 600, ml: 2 }} onClick={() => { setDialogMode('none'); setSelectedTicket(null); }}>Close</Button>
              </Box>
            )}
          </DialogContent>
        </Dialog>
        <Stack spacing={3}>
          {tickets.length === 0 ? (
            <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="h6">No tickets yet. Create one to get started!</Typography>
            </Paper>
          ) : (
            tickets.map(ticket => (
              <Card key={ticket._id} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, borderColor: 'primary.light' } }} onClick={() => { setSelectedTicket(ticket); setDialogMode('view'); }}>
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
                    <Button size="small" variant="outlined" color="primary" sx={{ mt: 1 }} onClick={e => { e.stopPropagation(); setSelectedTicket(ticket); setDialogMode('edit'); }}>Edit</Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
        {zoomedImage && (
          <Dialog open onClose={() => setZoomedImage(null)} maxWidth={false} PaperProps={{ sx: { background: 'rgba(0,0,0,0.9)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}>
            <Box onClick={() => setZoomedImage(null)} sx={{ cursor: 'zoom-out', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', p: 4 }}>
              <Box component="img" src={zoomedImage || ''} alt="Full size" sx={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 3, boxShadow: 8 }} />
            </Box>
          </Dialog>
        )}
      </Box>
    </React.Fragment>
  );
};

export default CustomerView;
