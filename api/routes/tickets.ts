import { Router } from 'express';
import Ticket from '../models/Ticket.ts';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  })
});

// Get tickets for the authenticated user
router.get('/', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    const token = auth.replace('Bearer ', '');
    let userId, isStaff;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      userId = payload._id;
      isStaff = payload.isStaff;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
    let tickets;
    if (isStaff) {
      tickets = await Ticket.find();
    } else {
      tickets = await Ticket.find({ user: userId });
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Create a new ticket
router.post('/', upload.array('image', 3), async (req, res) => {
  try {
    const { title, description, status, user, type, priority, assignedTo } = req.body;
    if (!title || !description || !status || !user || !type || !priority) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    let isStaff = false;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const token = auth.replace('Bearer ', '');
        const payload = jwt.verify(token, JWT_SECRET) as any;
        isStaff = payload.isStaff;
      } catch {}
    }
    if (assignedTo && !isStaff) {
      return res.status(403).json({ error: 'Only staff can assign tickets to staff members' });
    }
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      imageUrls = req.files.map((file: any) => '/uploads/' + file.filename);
    }
    const ticket = new Ticket({ title, description, status, user, type, priority, image: imageUrls });
    if (isStaff && assignedTo) {
      ticket.assignedTo = assignedTo;
    }
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create ticket', details: err });
  }
});

// Update a ticket by ID
router.put('/:id', upload.array('image', 3), async (req, res) => {
  try {
    const { id } = req.params;
    const update: any = {};
    const auth = req.headers.authorization;
    let isStaff = false;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const token = auth.replace('Bearer ', '');
        const payload = jwt.verify(token, JWT_SECRET) as any;
        isStaff = payload.isStaff;
      } catch {}
    }
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      console.log('Ticket not found');
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (!isStaff && ticket.status !== 'created') {
      console.log('Edit forbidden for non-staff, status:', ticket.status);
      return res.status(403).json({ error: 'Only tickets with status "created" can be edited' });
    }
    ['title', 'description', 'type', 'priority', 'status'].forEach(field => {
      if (req.body[field]) update[field] = req.body[field];
    });
    if ('assignedTo' in req.body) {
      if (!isStaff) {
        return res.status(403).json({ error: 'Only staff can assign tickets to staff members' });
      }
      update.assignedTo = req.body.assignedTo === '' ? null : req.body.assignedTo;
    }
    let currentImages: string[] = Array.isArray(ticket.image) ? ticket.image : ticket.image ? [ticket.image] : [];
    if (req.body.removedImages) {
      try {
        const removeIdxs: number[] = JSON.parse(req.body.removedImages);
        removeIdxs.forEach(idx => {
          const imgUrl = currentImages[idx];
          if (imgUrl) {
            const filePath = path.join(process.cwd(), imgUrl.replace(/^\//, ''));
            fs.unlink(filePath, err => {
              if (err) console.error('Failed to delete image:', filePath, err);
            });
          }
        });
        currentImages = currentImages.filter((_, idx) => !removeIdxs.includes(idx));
      } catch {}
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImageUrls = req.files.map((file: any) => '/uploads/' + file.filename);
      currentImages = [...currentImages, ...newImageUrls].slice(0, 3);
    }
    update.image = currentImages;
    const updatedTicket = await Ticket.findByIdAndUpdate(id, update, { new: true });
    res.json(updatedTicket);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update ticket', details: err });
  }
});

export default router;
