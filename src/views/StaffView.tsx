import React, { useState, useEffect } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TicketDialog from '../components/TicketDialog';
import type { Ticket, User } from '../types';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';

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
  const [userMap, setUserMap] = useState<Record<string, User>>({});

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



  const handleDragEnd = async (event: any) => {
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
      <KanbanBoard
        columns={columns}
        statuses={statuses}
        userMap={userMap}
        onTicketClick={setSelectedTicket}
        onEditClick={ticket => { setSelectedTicket(ticket); setEditMode(true); }}
        onDragEnd={handleDragEnd}
      />
      <TicketDialog
        ticket={selectedTicket}
        open={!!selectedTicket}
        user={user}
        userMap={userMap}
        editMode={editMode}
        onClose={() => { setSelectedTicket(null); setEditMode(false); }}
        onEdit={() => setEditMode(true)}
        onCancelEdit={() => setEditMode(false)}
        onSave={async (updated, updatedImages, removedIndexes) => {
          if (!selectedTicket) return;
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
        onRemove={async (id) => {
          if (!id) return;
          await fetch(`/api/tickets/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` },
          });
          setColumns(cols => {
            const updated = { ...cols };
            Object.keys(updated).forEach(status => {
              updated[status] = updated[status].filter(t => t._id !== id);
            });
            return updated;
          });
          setSelectedTicket(null);
          setEditMode(false);
        }}
      />
    </Box>
  );
};

export default StaffView;
