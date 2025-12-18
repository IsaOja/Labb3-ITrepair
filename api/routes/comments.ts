import { Router } from 'express';
import Comment from '../models/Comment.ts';
import Ticket from '../models/Ticket.ts';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Get all comments for a ticket
router.get('/tickets/:ticketId/comments', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const comments = await Comment.find({ ticket: ticketId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment to a ticket
router.post('/tickets/:ticketId/comments', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text } = req.body;
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    let username;
    try {
      const token = auth.replace('Bearer ', '');
      const payload = jwt.verify(token, JWT_SECRET) as any;
      username = payload.username;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text required' });
    }
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const comment = new Comment({ ticket: ticketId, author: username, text });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add comment', details: err });
  }
});

export default router;
