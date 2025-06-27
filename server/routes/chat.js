const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const axios = require('axios');
const FAQ = require('../models/FAQ');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// POST /api/chat
router.post('/', async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: 'userId and message required' });

  // Find or create conversation
  let convo = await Conversation.findOne({ userId });
  if (!convo) {
    convo = new Conversation({ userId, messages: [] });
  }
  convo.messages.push({ sender: 'user', text: message });

  // Basic string matching for FAQ
  let botReply = null;
  let source = 'gemini';
  let confidence = null;
  try {
    const faqs = await FAQ.find({});
    const userQ = message.trim().toLowerCase();
    let bestFaq = null;
    for (const faq of faqs) {
      if (faq.question && userQ.includes(faq.question.trim().toLowerCase())) {
        bestFaq = faq;
        break;
      }
      if (faq.question && faq.question.trim().toLowerCase().includes(userQ)) {
        bestFaq = faq;
        break;
      }
    }
    if (bestFaq) {
      botReply = bestFaq.answer;
      source = 'faq';
      confidence = 1.0;
    }
  } catch (err) {
    console.error('FAQ string match error:', err.message);
  }

  // Fallback to Gemini if no FAQ match
  if (!botReply) {
    botReply = 'Sorry, I could not get a response.';
    try {
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            { parts: [{ text: message }] }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      botReply = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || botReply;
      source = 'gemini';
      confidence = null;
    } catch (err) {
      console.error('Gemini API error:', err.message);
      botReply = 'Error contacting Gemini API.';
      source = 'gemini';
      confidence = null;
    }
  }

  convo.messages.push({ sender: 'bot', text: botReply, source, confidence });
  await convo.save();

  res.json({ reply: botReply, messages: convo.messages, source, confidence });
});

module.exports = router; 