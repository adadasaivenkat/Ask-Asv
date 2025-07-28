// Suppress dotenv debug messages completely
process.env.DOTENV_DEBUG = 'false';
process.env.DEBUG = '';

// Suppress console.log temporarily during dotenv load
const originalLog = console.log;
console.log = () => {};

require('dotenv').config({ silent: true, debug: false, override: true });

// Restore console.log
console.log = originalLog;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { marked } = require('marked');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  
  // Clean up any existing sessions with invalid message data
  const Session = require('./models/Session');
  const Conversation = require('./models/Conversation');
  
  // Remove messages without text field
  Session.updateMany(
    { 'messages.text': { $exists: false } },
    { $pull: { messages: { text: { $exists: false } } } }
  ).catch(err => {
    console.error('Error cleaning up sessions:', err);
  });
  
  // Remove messages with empty text
  Session.updateMany(
    { 'messages.text': { $in: [null, '', undefined] } },
    { $pull: { messages: { text: { $in: [null, '', undefined] } } } }
  ).catch(err => {
    console.error('Error cleaning up sessions with empty messages:', err);
  });
  
  // Same cleanup for conversations
  Conversation.updateMany(
    { 'messages.text': { $exists: false } },
    { $pull: { messages: { text: { $exists: false } } } }
  ).catch(err => {
    console.error('Error cleaning up conversations:', err);
  });
  
  Conversation.updateMany(
    { 'messages.text': { $in: [null, '', undefined] } },
    { $pull: { messages: { text: { $in: [null, '', undefined] } } } }
  ).catch(err => {
    console.error('Error cleaning up conversations with empty messages:', err);
  });
}).catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/history', require('./routes/history'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/sessions', require('./routes/sessions'));

// Add PDF export endpoint (using browserless.io API)
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body { 
          max-width: 700px; 
          margin: 0 auto; 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
          font-size: 16px; 
          padding: 32px; 
          background: #fff; 
          color: #222; 
          line-height: 1.6;
        }
        
        .first-page-header {
          text-align: center;
          margin-bottom: 3em;
          padding-bottom: 2em;
          border-bottom: 3px solid #f0f0f0;
          page-break-after: avoid;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 1.5em;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }
        
        .brand-name {
          font-size: 3em;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          font-family: 'Inter', sans-serif;
          color: #667eea;
          text-decoration: none;
          border: none;
          outline: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .header-info { 
          color: #6b7280; 
          font-size: 1.1em; 
          margin-top: 2em;
          display: flex;
          justify-content: center;
          gap: 2em;
          flex-wrap: nowrap;
          align-items: center;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5em;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .contact-label {
          color: #374151;
          font-weight: 600;
        }
        
        .chat-transcript {
          margin-top: 2em;
        }
        
        pre {
          background: #f8fafc;
          color: #1e293b;
          padding: 1.25em;
          border-radius: 12px;
          margin: 1em 0;
          font-size: 0.95em;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
          max-width: 100%;
          box-sizing: border-box;
          white-space: pre-wrap;
          word-break: break-word;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          page-break-inside: avoid;
        }
        
        code { 
          background: #f1f5f9; 
          color: #475569; 
          padding: 0.25em 0.5em; 
          border-radius: 6px; 
          font-size: 0.9em; 
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
          border: 1px solid #e2e8f0;
        }
        
        strong {
          color: #1f2937;
          font-weight: 600;
        }
        
        p {
          margin: 1em 0;
          page-break-inside: avoid;
          orphans: 2;
          widows: 2;
        }
        
        h1, h2, h3, h4, h5, h6 {
          color: #111827;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          page-break-after: avoid;
        }
        
        blockquote {
          border-left: 4px solid #667eea;
          padding-left: 1em;
          margin: 1em 0;
          color: #4b5563;
          font-style: italic;
          page-break-inside: avoid;
        }
        
        /* Print-specific styles */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .brand-name {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        /* Page break controls */
        .page-break {
          page-break-before: always;
        }
        
        .no-break {
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <!-- First page header - centered -->
      <div class="first-page-header">
        <div class="logo-container">
          <svg class="logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="asv-gradient-main" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stop-color="#667eea" />
                <stop offset="1" stop-color="#764ba2" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="20" fill="url(#asv-gradient-main)" />
            <text x="50%" y="56%" text-anchor="middle" fill="#fff" font-size="18" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="bold" dy=".1em">AA</text>
          </svg>
          <h1 class="brand-name">Ask Asv</h1>
        </div>
        <div class="header-info">
          <div class="contact-item">
            <span class="contact-label">Email:</span>
            <span>adadasaivenkat0109@gmail.com</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">Phone:</span>
            <span>+91 6300575648</span>
          </div>
        </div>
      </div>
      
      <div class="chat-transcript">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;
  
  // Use browserless.io API for PDF generation
  const browserlessToken = process.env.BROWSERLESS_TOKEN;
  
  if (!browserlessToken || browserlessToken === 'your_browserless_token') {
    console.error('BROWSERLESS_TOKEN not configured properly');
    // Fallback: return HTML content instead of PDF
    res.set({
      'Content-Type': 'text/html',
      'Content-Disposition': 'attachment; filename="chat.html"'
    });
    return res.send(html);
  }
  
  // Updated API endpoint to use the new production endpoint
  const apiUrl = `https://production-sfo.browserless.io/pdf?token=${browserlessToken}`;
  
  try {
    const response = await axios.post(
      apiUrl,
      {
        html: html,
        options: {
          format: 'A4',
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          },
          printBackground: true,
          displayHeaderFooter: false,
          preferCSSPageSize: true
        }
      },
      { 
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="chat.pdf"',
      'Content-Length': response.data.length
    });
    res.send(response.data);
    
  } catch (err) {
    console.error('PDF generation error:', err.message);
    if (err.response) {
      console.error('API response error:', err.response.status);
      if (err.response.data) {
        console.error('Response data:', err.response.data.toString());
      }
    }
    
    // Fallback: return HTML content instead of PDF
    console.log('Falling back to HTML export...');
    res.set({
      'Content-Type': 'text/html',
      'Content-Disposition': 'attachment; filename="chat.html"'
    });
    res.send(html);
  }
});

app.get("/", (req, res) => {
  res.send("Ask Asv backend is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ask Asv backend running on port ${PORT}`);
});