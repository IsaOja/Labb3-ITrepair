import React, { useState, useEffect } from 'react';
import { DndContext, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import type { Ticket, User } from '../types';
import EditTicketForm from '../components/EditTicketForm';
import { Dialog, DialogContent, Box, Stack, Typography, Button, IconButton, Avatar, Chip, Alert, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';

const statuses = ['created', 'in progress', 'closed'];

interface StaffViewProps {
  user: User;
}

const StaffView: React.FC<StaffViewProps> = ({ user }) => {
  const [columns, setColumns] = useState<{ [status: string]: Ticket[] }>({ created: [], 'in progress': [], closed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [comments, setComments] = useState<Array<{_id: string, author: string, text: string, createdAt: string}>>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      const allTickets = Object.values(columns).flat();
      const assignedIds = Array.from(new Set(allTickets.map(t => t.assignedTo).filter(Boolean)));
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
    fetchAssignedUsers();
  }, [columns, user.token]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/tickets', {
      headers: {
        'Authorization': `Bearer ${user.token}`,
      }
    })
      .then(res => res.json())
      .then((data: Ticket[]) => {
        const priorityOrder = ['urgent', 'high', 'medium', 'low'];
        const grouped: { [status: string]: Ticket[] } = { created: [], 'in progress': [], closed: [] };
        data.forEach(ticket => {
          if (statuses.includes(ticket.status)) grouped[ticket.status].push(ticket);
        });
        
        Object.keys(grouped).forEach(status => {
          grouped[status] = grouped[status].sort((a, b) =>
            priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
          );
        });
        setColumns(grouped);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch tickets');
        setLoading(false);
      });
  }, [refresh]);

  useEffect(() => {
    if (editMode || !selectedTicket) {
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
  }, [selectedTicket, editMode, user.token]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;
    const ticketId = active.id as string;
    const overId = over.id as string;
    const sourceStatus = Object.keys(columns).find(status => columns[status].some(t => t._id === ticketId));
    
    const destStatus = statuses.find(status => {
      if (status === overId) return true; 
      return columns[status].some(t => t._id === overId);
    });
    if (!sourceStatus || !destStatus || sourceStatus === destStatus) return;

    setColumns(prev => {
      const movedTicket = prev[sourceStatus].find(t => t._id === ticketId);
      if (!movedTicket) return prev;
      const updatedTicket = { ...movedTicket, status: destStatus };
      
      const newSource = prev[sourceStatus].filter(t => t._id !== ticketId);
      
      let dropIndex = prev[destStatus].findIndex(t => t._id === overId);
      if (dropIndex === -1) dropIndex = prev[destStatus].length; 
      
      const newDest = [
        ...prev[destStatus].slice(0, dropIndex),
        updatedTicket,
        ...prev[destStatus].slice(dropIndex)
      ];
      return {
        ...prev,
        [sourceStatus]: newSource,
        [destStatus]: newDest,
      };
    });

    try {
      const formData = new FormData();
      formData.append('status', destStatus);
      console.log('Sending PUT /api/tickets/' + ticketId + ' with status:', destStatus);
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData,
      });
      setRefresh(r => r + 1);
    } catch {
      alert('Failed to update ticket status');
      setRefresh(r => r + 1); 
    }
  };

  return (
    <Box>
      <Typography data-testid="staff-board-title" variant="h4" fontWeight={700} mb={3}>All Tickets (Kanban Board)</Typography>
      {loading && <Box display="flex" alignItems="center" gap={2}><CircularProgress size={24} /><Typography>Loading...</Typography></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      <DndContext collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
        <SortableContext
          items={Object.values(columns).flat().map(t => t._id)}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={{ display: 'flex', gap: 2, mt: 3, height: '70vh' }}>
            {statuses.map(status => (
              <KanbanColumn
                key={status + '-' + columns[status].map(t => t._id).join(',')}
                status={status}
                tickets={columns[status]}
                onTicketClick={setSelectedTicket}
                onEditClick={ticket => { setSelectedTicket(ticket); setEditMode(true); }}
                userMap={userMap}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>
      {selectedTicket && (
        <Dialog data-testid="staff-ticket-dialog" open onClose={() => { setSelectedTicket(null); setEditMode(false); }} maxWidth="sm" fullWidth>
          <DialogContent sx={{ p: 4, position: 'relative', maxHeight: '90vh' }}>
            <IconButton data-testid="staff-popup-close" aria-label="close" onClick={() => { setSelectedTicket(null); setEditMode(false); }} sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.500' }}>
              <CloseIcon fontSize="large" />
            </IconButton>
            {editMode ? (
              <EditTicketForm
                ticket={selectedTicket}
                currentUser={user}
                onSave={async (updated, updatedImages, removedIndexes) => {
                  const formData = new FormData();
                  formData.append('title', updated.title);
                  formData.append('description', updated.description);
                  formData.append('type', updated.type);
                  formData.append('priority', updated.priority);
                  formData.append('assignedTo', updated.assignedTo ?? '');
                  updatedImages.forEach(img => { if (img) formData.append('image', img); });
                  formData.append('removedImages', JSON.stringify(removedIndexes));
                  const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${user.token}` },
                    body: formData,
                  });
                  if (res.ok) {
                    const newTicket = await res.json();
                    setColumns(cols => {
                      const updated = { ...cols };
                      Object.keys(updated).forEach(status => {
                        updated[status] = updated[status].map(t => t._id === newTicket._id ? newTicket : t);
                      });
                      return updated;
                    });
                    setSelectedTicket(newTicket);
                    setEditMode(false);
                  }
                }}
                onCancel={() => setEditMode(false)}
              />
              ) : (
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Chip
                    label={selectedTicket.status.replace(/\b\w/g, l => l.toUpperCase())}
                    color={selectedTicket.status === 'created' ? 'primary' : selectedTicket.status === 'in progress' ? 'warning' : 'success'}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: 14, px: 2, py: 0.5 }}
                  />
                  <Typography data-testid="staff-popup-title" variant="h5" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{selectedTicket.title}</Typography>
                </Stack>
                <Typography color="text.secondary" mb={3} sx={{ borderBottom: '1px solid #eee', pb: 2 }}><b>Description:</b> {selectedTicket.description}</Typography>
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
                  <Typography data-testid="staff-comments-title" variant="h6" fontWeight={700} mb={1}>Comments</Typography>
                  <Stack data-testid="staff-comments-container" spacing={1} mb={2} sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: '#f9f9fa', p: 2, borderRadius: 2, border: '1px solid #eee' }}>
                    {comments.length === 0 && <Typography color="text.secondary">No comments yet.</Typography>}
                    {comments.map(comment => (
                      <Box data-testid={`staff-comment-${comment._id}`} key={comment._id} sx={{ bgcolor: comment.author === user.username ? '#e3f2fd' : '#fff', p: 1.2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{comment.author} <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 8 }}>{new Date(comment.createdAt).toLocaleString()}</span></Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{comment.text}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      data-testid="staff-comment-input"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      size="small"
                      placeholder="Write a comment..."
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={4}
                      disabled={commentLoading}
                    />
                    <Button
                      data-testid="staff-comment-send"
                      variant="contained"
                      color="primary"
                      disabled={!commentInput.trim() || commentLoading}
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
                <Button data-testid="staff-popup-edit" variant="contained" color="primary" sx={{ mt: 2, fontWeight: 600 }} onClick={() => setEditMode(true)}>Edit</Button>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      )}
      {zoomedImage && (
        <Dialog open onClose={() => setZoomedImage(null)} maxWidth={false} PaperProps={{ sx: { background: 'rgba(0,0,0,0.9)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}>
          <Box onClick={() => setZoomedImage(null)} sx={{ cursor: 'zoom-out', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', p: 4 }}>
            <Box component="img" src={zoomedImage || ''} alt="Zoomed ticket attachment" sx={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 3, boxShadow: 8 }} />
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default StaffView;
