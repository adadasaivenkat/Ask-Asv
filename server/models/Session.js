const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  source: { type: String },
  confidence: { type: Number }
});

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema); 