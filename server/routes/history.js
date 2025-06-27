const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

// GET /api/history/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const convo = await Conversation.findOne({ userId });
  if (!convo) return res.json({ messages: [] });
  res.json({ messages: convo.messages });
});

module.exports = router; 