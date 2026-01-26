import express from 'express';
import cors from 'cors';
import path from 'path';
import * as taskStore from './taskStore';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/tasks', (req, res) => {
  res.json(taskStore.getTasks());
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (typeof title !== 'string') {
    return res.status(400).json({ message: 'Invalid title format' });
  }

  // To check if title is empty or just a whitespace
  // if (title.trim().length === 0) {
  //     return res.status(400).json({ message: 'Title cannot be empty' });
  // }

  const newTask = taskStore.addTask(title);

  if (!newTask) {
    return res.status(400).json({ message: 'Error creating task' });
  }

  res.status(201).json(newTask);
});

app.patch('/tasks/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updatedTask = taskStore.toggleTask(id);

  if (!updatedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.json(updatedTask);
});

app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success = taskStore.deleteTask(id);

  if (!success) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.status(204).send();
});

// Serve the frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app; // Export for testing
