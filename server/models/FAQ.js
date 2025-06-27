const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  embedding: { type: [Number] } // Optional, for future embedding-based search
});

module.exports = mongoose.model('FAQ', faqSchema); 