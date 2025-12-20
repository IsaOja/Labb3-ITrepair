import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, Avatar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from '../types';

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
        inputProps={{ 'data-testid': 'create-ticket-title-input' }}
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
        inputProps={{ 'data-testid': 'create-ticket-description-input' }}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            name="type"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            inputProps={{ 'data-testid': 'create-ticket-type-select' }}
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
            inputProps={{ 'data-testid': 'create-ticket-priority-select' }}
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

export default CreateTicketForm;
