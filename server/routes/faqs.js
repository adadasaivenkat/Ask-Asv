const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const upload = multer({ dest: 'uploads/' });
const mammoth = require('mammoth'); // For DOCX
const { parse } = require('csv-parse/sync'); // For CSV

// POST /api/faqs/upload
router.post('/upload', async (req, res) => {
  const { faqs } = req.body; // Expecting { faqs: [{question, answer}, ...] }
  if (!faqs || !Array.isArray(faqs)) return res.status(400).json({ error: 'faqs array required' });
  try {
    await FAQ.deleteMany({}); // Clear old FAQs (optional)
    await FAQ.insertMany(faqs);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/faqs - List all FAQ chunks
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find({});
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/faqs - Delete all FAQ chunks
router.delete('/all', async (req, res) => {
  try {
    await FAQ.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/faqs/:id - Delete a single FAQ chunk
router.delete('/:id', async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/faqs/upload-file
router.post('/upload-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const filePath = req.file.path;
  let text = '';
  let fileType = req.file.mimetype;
  let faqs = [];
  try {
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
      fileType = 'pdf';
    } else if (req.file.mimetype === 'text/plain') {
      text = fs.readFileSync(filePath, 'utf8');
      fileType = 'txt';
      // Parse Q/A pairs from text
      const lines = text.split(/\r?\n/);
      let currentQ = null;
      let currentA = null;
      for (let line of lines) {
        if (line.trim().startsWith('Q:')) {
          if (currentQ && currentA) {
            faqs.push({ question: currentQ.trim(), answer: currentA.trim(), fileType });
            currentA = null;
          }
          currentQ = line.replace(/^Q:/i, '').trim();
        } else if (line.trim().startsWith('A:')) {
          currentA = line.replace(/^A:/i, '').trim();
        } else if (currentA && line.trim() !== '') {
          // Support multi-line answers
          currentA += ' ' + line.trim();
        }
      }
      if (currentQ && currentA) {
        faqs.push({ question: currentQ.trim(), answer: currentA.trim(), fileType });
      }
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.originalname.endsWith('.docx')) {
      const dataBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      text = result.value;
      fileType = 'docx';
    } else if (req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv')) {
      const csvData = fs.readFileSync(filePath, 'utf8');
      const records = parse(csvData, { columns: false, skip_empty_lines: true });
      text = records.map(row => row.join(' ')).join('\n');
      fileType = 'csv';
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unsupported file type' });
    }
    fs.unlinkSync(filePath); // Clean up
  } catch (err) {
    return res.status(500).json({ error: 'File processing failed: ' + err.message });
  }

  // For non-txt files, use old chunking logic
  if (faqs.length === 0 && text) {
    let chunks = text.split(/\n\n+/).filter(Boolean);
    if (chunks.length === 1 && chunks[0].length > 500) {
      chunks = chunks[0].match(/.{1,500}/g);
    }
    for (const chunk of chunks) {
      faqs.push({ question: chunk.slice(0, 100), answer: chunk, fileType });
    }
  }

  try {
    await FAQ.insertMany(faqs);
    res.json({ success: true, count: faqs.length, fileType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 