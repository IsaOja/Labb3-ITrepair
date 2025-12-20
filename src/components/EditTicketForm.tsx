import React, { useState, useEffect } from 'react';
import type { Ticket, User } from '../types';
import { Box, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Avatar, IconButton } from '@mui/material';

interface EditTicketFormProps {
  ticket: Ticket;
  onSave: (updated: Ticket, updatedImages: (File | null)[], removedImageIndexes: number[]) => void;
  onCancel: () => void;
  currentUser?: User;
}

const EditTicketForm: React.FC<EditTicketFormProps> = ({ ticket, onSave, onCancel, currentUser }) => {
  const [form, setForm] = useState<{
    title: string;
    description: string;
    type: string;
    priority: string;
    assignedTo: string;
  }>({
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    priority: ticket.priority,
    assignedTo: ticket.assignedTo || '',
  });
  const existingImages: string[] = Array.isArray(ticket.image) ? ticket.image : ticket.image ? [ticket.image] : [];
  const [newImages, setNewImages] = useState<(File | null)[]>([]);
  const [removedIndexes, setRemovedIndexes] = useState<number[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const res = await fetch('/api/users/staff/list', {
          headers: { 'Authorization': `Bearer ${currentUser.token}` },
        });
        const users = res.ok ? await res.json() : [];
        const staff: User[] = Array.isArray(users) ? users : [];
        if (ticket.assignedTo && !staff.some(s => s._id === ticket.assignedTo)) {
          try {
            const r2 = await fetch(`/api/users/${ticket.assignedTo}`, {
              headers: { 'Authorization': `Bearer ${currentUser.token}` },
            });
            if (r2.ok) {
              const assignedUser = await r2.json();
              if (assignedUser && assignedUser._id) staff.push(assignedUser as User);
            }
          } catch (e) {
            // Ignore errors
          }
        }
        setStaffList(staff);
        if (ticket.assignedTo && !staff.some(s => s._id === ticket.assignedTo)) {
          setForm(f => ({ ...f, assignedTo: '' }));
        }
      } catch (err) {
        setStaffList([]);
      }
    };
    load();
  }, [currentUser, ticket.assignedTo]);

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (existingImages.length - removedIndexes.length + newImages.length < 3) {
        setNewImages([...newImages, e.target.files[0]]);
      }
    }
  };

  const handleRemoveExisting = (idx: number) => {
    setRemovedIndexes([...removedIndexes, idx]);
  };

  const handleRemoveNew = (idx: number) => {
    setNewImages(newImages.filter((_, i) => i !== idx));
  };

  return (
    <Box
      component="form"
      onSubmit={e => {
        e.preventDefault();
        const assignedToValue = form.assignedTo === '' ? null : form.assignedTo;
        onSave({ ...ticket, ...form, assignedTo: assignedToValue }, newImages, removedIndexes);
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        bgcolor: 'grey.50',
        borderRadius: 3,
        boxShadow: 3,
        p: 4,
        minWidth: 340,
        maxWidth: 480,
      }}
    >
      <Typography variant="h5" fontWeight={700} mb={2}>Edit Ticket</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <InputLabel sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>Title</InputLabel>
        <TextField
          name="title"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
          size="small"
          inputProps={{ 'data-testid': 'edit-title' }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <InputLabel sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>Description</InputLabel>
        <TextField
          name="description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          required
          multiline
          minRows={4}
          size="small"
          inputProps={{ 'data-testid': 'edit-description' }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <FormControl fullWidth size="small" sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={form.type}
            label="Type"
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            inputProps={{ 'data-testid': 'edit-type' }}
          >
            <MenuItem value="hardware">Hardware</MenuItem>
            <MenuItem value="software">Software</MenuItem>
            <MenuItem value="network">Network</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            name="priority"
            value={form.priority}
            label="Priority"
            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            inputProps={{ 'data-testid': 'edit-priority' }}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>
        {currentUser?.isStaff && (
          <FormControl fullWidth size="small" sx={{ minWidth: 120, flex: 1 }}>
            <InputLabel shrink>Assign to Staff</InputLabel>
            <Select
              name="assignedTo"
              value={form.assignedTo ?? ''}
              label="Assign to Staff"
              onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
              displayEmpty
              inputProps={{ 'data-testid': 'edit-assignedTo' }}
              renderValue={selected => {
                if (!selected) return <em>Unassigned</em>;
                const staff = staffList.find(s => s._id === selected);
                return staff ? staff.username : <em>Unassigned</em>;
              }}
            >
              <MenuItem value=""><em>Unassigned</em></MenuItem>
              {staffList.map(staff => (
                <MenuItem key={staff._id} value={staff._id} data-testid={`edit-staff-${staff._id}`}>{staff.username}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      <Box>
        <Typography fontWeight={600} color="primary" mb={1}>Images</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          {existingImages.map((img: string, idx: number) =>
            removedIndexes.includes(idx) ? null : (
              <Box key={img} sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar variant="rounded" src={img} alt={`Ticket image ${idx + 1}`} sx={{ width: 90, height: 90, border: '2px solid #eee', boxShadow: 1 }} />
                <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'error.main', color: 'white', width: 24, height: 24, fontSize: 16 }} onClick={() => handleRemoveExisting(idx)}>
                  ×
                </IconButton>
              </Box>
            )
          )}
          {newImages.map((file, idx) => (
            <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar variant="rounded" src={URL.createObjectURL(file!)} alt={`New image ${idx + 1}`} sx={{ width: 90, height: 90, border: '2px solid #eee', boxShadow: 1 }} />
              <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'error.main', color: 'white', width: 24, height: 24, fontSize: 16 }} onClick={() => handleRemoveNew(idx)}>
                ×
              </IconButton>
            </Box>
          ))}
          {existingImages.length - removedIndexes.length + newImages.length < 3 && (
            <Button variant="outlined" component="label" sx={{ width: 90, height: 90, borderRadius: 2, borderStyle: 'dashed' }}>
              +
              <input type="file" accept="image/*" hidden onChange={handleAddImage} />
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary" data-testid="editTicketForm-submit" sx={{ flex: 1, fontWeight: 600 }}>Save</Button>
        <Button type="button" onClick={onCancel} variant="outlined" color="secondary" data-testid="editTicketForm-cancel" sx={{ flex: 1, fontWeight: 600 }}>Cancel</Button>
      </Box>
    </Box>
  );
};

export default EditTicketForm;
