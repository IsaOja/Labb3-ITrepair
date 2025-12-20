import React, { useState, useEffect } from 'react';
import type { Ticket, User } from '../types';
import { Box, Typography, Button, Dialog, DialogContent} from '@mui/material';
import EditTicketForm from '../components/EditTicketForm';
import CreateTicketForm from '../components/CreateTicketForm';
import TicketList from '../components/TicketList';
import TicketDetailsDialog from '../components/TicketDetailsDialog';
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
        <TicketDetailsDialog
          open={dialogMode === 'view' && !!selectedTicket}
          ticket={selectedTicket}
          user={user}
          userMap={userMap}
          comments={comments}
          commentInput={commentInput}
          commentLoading={commentLoading}
          zoomedImage={zoomedImage}
          onClose={() => { setDialogMode('none'); setSelectedTicket(null); }}
          onEdit={() => setDialogMode('edit')}
          onCommentInput={setCommentInput}
          onSendComment={async () => {
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
          onZoomImage={setZoomedImage}
        />
        <TicketList
          tickets={tickets}
          userMap={userMap}
          onSelect={ticket => { setSelectedTicket(ticket); setDialogMode('view'); }}
          onEdit={ticket => { setSelectedTicket(ticket); setDialogMode('edit'); }}
        />
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
