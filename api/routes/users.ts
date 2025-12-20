import { Router } from 'express';
import User from '../models/User.ts';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Get current user info from token
router.get('/', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && '_id' in decoded) {
      const user = await User.findById((decoded as { _id: string })._id).select('_id username role');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } else {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get public info for a user by ID (for assignedTo lookups)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('_id username role isStaff');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get list of staff users
router.get('/staff/list', async (req, res) => {
  try {
    const staff = await User.find({ isStaff: true }).select('_id username role isStaff');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff users' });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, isStaff } = req.body;
    const user = new User({ username, email, password, isStaff });
    await user.save();
    const token = jwt.sign({
      _id: user._id,
      username: user.username,
      isStaff: user.isStaff,
      email: user.email,
    }, JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isStaff: user.isStaff,
      }
    });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create user', details: err });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({
      _id: user._id,
      username: user.username,
      isStaff: user.isStaff,
      email: user.email,
    }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { _id: user._id, username: user.username, isStaff: user.isStaff, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err });
  }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete user', details: err });
  }
});

export default router;
