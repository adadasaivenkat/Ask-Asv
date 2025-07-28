const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// Get all sessions for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const sessions = await Session.find({ userId }).sort({ updatedAt: -1 });
  res.json(sessions);
});

// Create a new session
router.post('/', async (req, res) => {
  const { userId, title } = req.body;
  // Prevent duplicate empty sessions for the same user and title
  const existing = await Session.findOne({ userId, title, messages: { $size: 0 } });
  if (existing) return res.json(existing);
  const session = new Session({ userId, title, messages: [] });
  await session.save();
  res.json(session);
});

// Add a message to a session
router.post('/:sessionId/message', async (req, res) => {
  const { sessionId } = req.params;
  const { sender, text, source, confidence } = req.body;
  
  // Validate required fields
  if (!sender || !text || text.trim() === '') {
    return res.status(400).json({ error: 'sender and text are required' });
  }
  
  const session = await Session.findById(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  session.messages.push({ sender, text: text.trim(), source, confidence });
  await session.save();
  res.json(session);
});

module.exports = router; 