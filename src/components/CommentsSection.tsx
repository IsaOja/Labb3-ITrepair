import React from 'react';
import { Stack, Typography, Box, TextField, Button } from '@mui/material';

interface Comment {
  _id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  userName: string;
  input: string;
  loading: boolean;
  onInput: (val: string) => void;
  onSend: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, userName, input, loading, onInput, onSend }) => (
  <Box mb={3}>
    <Typography variant="h6" fontWeight={700} mb={1}>Comments</Typography>
    <Stack spacing={1} mb={2} sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: '#f9f9fa', p: 2, borderRadius: 2, border: '1px solid #eee' }}>
      {comments.length === 0 && <Typography color="text.secondary">No comments yet.</Typography>}
      {comments.map(comment => (
        <Box key={comment._id} sx={{ bgcolor: comment.author === userName ? '#e3f2fd' : '#fff', p: 1.2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>{comment.author} <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 8 }}>{new Date(comment.createdAt).toLocaleString()}</span></Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{comment.text}</Typography>
        </Box>
      ))}
    </Stack>
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField
        value={input}
        onChange={e => onInput(e.target.value)}
        size="small"
        placeholder="Write a comment..."
        fullWidth
        multiline
        minRows={1}
        maxRows={4}
        disabled={loading}
        data-testid="customer-comment-input"
      />
      <Button
        variant="contained"
        color="primary"
        disabled={!input.trim() || loading}
        data-testid="customer-comment-send"
        onClick={onSend}
        sx={{ minWidth: 90 }}
      >Send</Button>
    </Stack>
  </Box>
);

export default CommentsSection;
