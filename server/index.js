require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { marked } = require('marked');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/history', require('./routes/history'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/sessions', require('./routes/sessions'));

// Add Puppeteer PDF export endpoint
app.post('/api/export-pdf', async (req, res) => {
  const { messages, userLabel } = req.body;
  let md = '';
  messages.forEach(m => {
    if (m.sender === 'bot') {
      md += `**Asv:** ${m.text}\n\n`;
    } else {
      md += `**${userLabel}:** ${m.text}\n\n`;
    }
  });
  const htmlContent = marked.parse(md);
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ask Asv</title>
      <style>
        body { max-width: 700px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 16px; padding: 32px; background: #fff; color: #222; }
        h1 { color: #667eea; text-align: center; margin-bottom: 0.5em; }
        .header-info { color: #4a5568; text-align: center; font-size: 1.1em; margin-bottom: 2em; }
        hr { border: none; border-top: 2px solid #23232b; margin: 2em 0; }
        pre {
          background: #f5f5f5;
          color: #222;
          padding: 1em;
          border-radius: 8px;
          margin: 0.5em 0;
          font-size: 0.98em;
          font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
          max-width: 100%;
          box-sizing: border-box;
          white-space: pre-wrap;
          word-break: break-word;
        }
        code { background: #ececec; color: #222; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.95em; font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace; }
      </style>
    </head>
    <body>
      <h1>Ask Asv</h1>
      <div class="header-info">
        <div><b>Email:</b> adadasaivenkat0109@gmail.com</div>
        <div><b>Phone:</b> +91 6300575648</div>
      </div>
      <hr />
      <div class="chat-transcript">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="chat.pdf"',
    'Content-Length': pdfBuffer.length
  });
  res.send(pdfBuffer);
});

app.get("/", (_req, res) => {
  res.send("Ask Asv backend is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ask Asv backend running on port ${PORT}`);
}); 