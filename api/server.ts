import express from 'express';
import mongoose from 'mongoose';
import usersRouter from './routes/users.ts';
import ticketsRouter from './routes/tickets.ts';
import commentsRouter from './routes/comments.ts';

const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/users', usersRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api', commentsRouter);

try {
  mongoose.connect('mongodb://localhost:27017/labb3', {
  })
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
    });
} catch (err) {
  console.error('Top-level error:', err);
}