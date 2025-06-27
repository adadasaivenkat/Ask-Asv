import React, { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, SignIn, SignUp, useClerk, useUser, UserButton } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import { Plus, MessageSquare, X, Send, User, Mic, FileText, Trash2 } from 'lucide-react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { UploadCloud as UploadCloudIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// Enhanced ChatBubble to show FAQ badge/confidence
const ChatBubble = ({ sender, text, source, confidence }) => (
  <div className={`chat-bubble ${sender}`}>
    {sender === 'bot' ? (
      <div className="markdown">
        <ReactMarkdown>
          {source === 'faq' ? `${text} ★` : text}
        </ReactMarkdown>
      </div>
    ) : (
      <span>{text}</span>
    )}
  </div>
);

// AdminUpload component (always visible, scrollable, responsive)
const AdminUpload = () => {
  const { user } = useUser();
  // Only show for admins
  if (!user || user.publicMetadata?.role !== 'admin') return null;

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef();

  // Fetch all FAQs
  const fetchFaqs = async () => {
    const res = await fetch(`${API_URL}/api/faqs`);
    const data = await res.json();
    setFaqs(data);
  };
  useEffect(() => { fetchFaqs(); }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  // Drag and drop support
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError(null);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Upload with progress
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setResult(null);
    setError(null);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/faqs/upload-file`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = async () => {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          setResult(`Uploaded successfully: ${file.name} (${data.count} chunks)`);
          setSuccessMsg(`Uploaded successfully: ${file.name} (${data.count} chunks)`);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 4000);
          await fetchFaqs();
        } else {
          setError(data.error || 'Upload failed');
        }
        setUploading(false);
        setProgress(0);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
      };
      xhr.onerror = () => {
        setError('Upload failed');
        setUploading(false);
        setProgress(0);
      };
      xhr.send(formData);
    } catch (err) {
      setError('Upload failed: ' + err.message);
      setUploading(false);
      setProgress(0);
    }
  };

  // Delete all FAQs (custom modal)
  const handleDeleteAll = async () => {
    setShowDeleteModal(true);
  };
  const confirmDeleteAll = async () => {
    setShowDeleteModal(false);
    await fetch(`${API_URL}/api/faqs`, { method: 'DELETE' });
    await fetchFaqs();
  };
  const cancelDeleteAll = () => {
    setShowDeleteModal(false);
  };

  // Delete one FAQ
  const handleDeleteOne = async (id) => {
    await fetch(`${API_URL}/api/faqs/${id}`, { method: 'DELETE' });
    await fetchFaqs();
  };

  return (
    <div className="admin-upload-card">
      <div className="admin-upload-header">
        <span className="admin-upload-title">
          <UploadCloudIcon size={28} className="admin-upload-title-icon" />
          <span>Admin: Upload FAQ/Company Data</span>
        </span>
      </div>
      <button className="admin-upload-modal-btn" onClick={() => setModalOpen(true)}>Open Upload Modal</button>
      {modalOpen && (
        <div className="admin-upload-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-upload-modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleUpload} className="admin-upload-form" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }} onDrop={handleDrop} onDragOver={handleDragOver}>
              {/* FAQ Format Instructional Message */}
              <div className="admin-upload-faq-instructions" style={{ width: '95%', marginBottom: '1.2rem', background: '#181b20', color: '#a3bffa', borderRadius: '8px', padding: '1.1rem 1.2rem', fontSize: '1rem', lineHeight: 1.7, textAlign: 'left', boxSizing: 'border-box', maxWidth: '420px' }}>
                <b style={{ display: 'block', marginBottom: '0.3rem' }}>How to format your FAQ file:</b>
                <span style={{ color: '#a3bffa', fontSize: '0.98rem' }}>Each question and answer should start with <code>Q:</code> and <code>A:</code> on separate lines. For example:</span>
                <pre style={{ background: '#23232b', color: '#fff', borderRadius: '6px', padding: '0.8rem', marginTop: '0.8rem', fontSize: '0.98rem', whiteSpace: 'pre-wrap', marginBottom: 0 }}>{`Q: How do I contact support?
A: Email us at adadasaivenkat0109@gmail.com or call +91 6300575648.`}</pre>
              </div>
              {/* Upload row: icon, file name, and button on one line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'center', marginBottom: '1.2rem' }}>
                <label htmlFor="custom-file-upload" className="icon-upload-btn" title="Upload file" style={{ margin: 0 }}>
                  <input
                    id="custom-file-upload"
                    type="file"
                    accept=".pdf,.txt,.docx,.csv"
                    onChange={handleFileChange}
                    disabled={uploading}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  <UploadCloudIcon size={28} />
                </label>
                <span className="selected-file-name" style={{ margin: 0, minWidth: 0, flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file ? file.name : 'No file chosen'}</span>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className={`admin-upload-btn${uploading ? ' uploading' : ''}`}
                  style={{ margin: 0 }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
            {uploading && <div className="admin-upload-progress-bar"><div style={{ width: progress + '%' }} /></div>}
            {showSuccess && (
              <div className="admin-upload-success modern-success">{successMsg}</div>
            )}
            {error && <div className="admin-upload-error">{error}</div>}
            <div className="admin-upload-hint">Accepted: PDF, TXT, DOCX, CSV. Chunks will be auto-processed for smart answers.</div>
            <button className="admin-upload-modal-close" onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Custom Delete All Modal */}
      {showDeleteModal && (
        <div className="admin-upload-modal-overlay" onClick={cancelDeleteAll}>
          <div className="admin-upload-modal delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-message">Are you sure you want to delete all FAQ chunks?</div>
            <div className="delete-modal-actions">
              <button className="admin-upload-modal-close" onClick={cancelDeleteAll}>Cancel</button>
              <button className="admin-upload-delete-all modal-delete-btn" style={{ marginLeft: '1rem' }} onClick={confirmDeleteAll}>
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="admin-upload-faq-list">
        <div className="admin-upload-faq-list-header">
          <span>Uploaded Chunks ({faqs.length})</span>
          <button
            className="admin-upload-delete-all delete-all-with-icon"
            onClick={handleDeleteAll}
            disabled={faqs.length === 0}
          >
            <Trash2 size={16} style={{ marginRight: '0.35em', verticalAlign: 'middle' }} />
            <span style={{ verticalAlign: 'middle' }}>Delete All</span>
          </button>
        </div>
        <div className="admin-upload-faq-chunks">
          {faqs.map(faq => (
            <div key={faq._id} className="admin-upload-faq-chunk">
              <FileText size={16} />
              <div className="admin-upload-faq-q"><b>Q:</b> {faq.question}</div>
              <div className="admin-upload-faq-a"><b>A:</b> {faq.answer}</div>
              <button className="admin-upload-delete-one" onClick={() => handleDeleteOne(faq._id)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Admin Portal Page
const AdminPortal = () => (
  <div style={{ padding: '0 2rem 2rem 2rem', position: 'relative' }}>
    <div className="admin-portal-topbar">
      <h2 className="admin-portal-title">Admin Portal</h2>
      <a href="/" className="continue-to-chat-link">&larr; Continue to Chat</a>
    </div>
    <div className="admin-portal-center">
      <AdminUpload />
    </div>
    {/* Add more admin tools here as needed */}
  </div>
);

const ChatUI = ({ userId }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);
  const { openUserProfile } = useClerk();
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const WELCOME_MSG = "Hello! I'm Asv, your AI assistant. How can I help you today?";
  const [botMeta, setBotMeta] = useState([]); // [{source, confidence}]
  const navigate = useNavigate();
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  // Fetch all sessions on login
  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/sessions/${userId}`)
      .then(res => res.json())
      .then(sessions => {
        setChatSessions(sessions);
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0]._id);
          setMessages(sessions[0].messages);
        } else if (!creatingSession) {
          setCreatingSession(true);
          createNewChat();
        }
      });
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const createNewChat = async () => {
    const res = await fetch(`${API_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title: 'New Chat' })
    });
    // After creating, fetch sessions again and set the current session to the first one
    const sessionsRes = await fetch(`${API_URL}/api/sessions/${userId}`);
    const sessions = await sessionsRes.json();
    setChatSessions(sessions);
    if (sessions.length > 0) {
      setCurrentSessionId(sessions[0]._id);
      setMessages(sessions[0].messages);
    } else {
      setCurrentSessionId(null);
      setMessages([]);
    }
    setSidebarOpen(false);
    setCreatingSession(false);
  };

  const selectChatSession = (sessionId) => {
    const session = chatSessions.find(s => s._id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setSidebarOpen(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !currentSessionId) return;

    const userMessage = {
      sender: 'user',
      text: input.trim(),
    };

    setInput('');
    setLoading(true);

    // Add user message to backend session
    await fetch(`${API_URL}/api/sessions/${currentSessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userMessage)
    });

    // Get updated session
    const sessionRes = await fetch(`${API_URL}/api/sessions/${userId}`);
    const sessions = await sessionRes.json();
    setChatSessions(sessions);
    const currentSession = sessions.find(s => s._id === currentSessionId);
    setMessages(currentSession ? currentSession.messages : []);

    // Call your backend AI API
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: userMessage.text })
      });
      const data = await res.json();
      const botMessage = {
        sender: 'bot',
        text: data.reply,
        source: data.source,
        confidence: data.confidence,
      };
      // Add bot message to backend session
      await fetch(`${API_URL}/api/sessions/${currentSessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botMessage)
      });
      // Get updated session
      const sessionRes2 = await fetch(`${API_URL}/api/sessions/${userId}`);
      const sessions2 = await sessionRes2.json();
      setChatSessions(sessions2);
      const currentSession2 = sessions2.find(s => s._id === currentSessionId);
      setMessages(currentSession2 ? currentSession2.messages : []);
    } catch (err) {
      // Handle error
      const botMessage = {
        sender: 'bot',
        text: "Sorry, I couldn't get a response from the AI service.",
      };
      await fetch(`${API_URL}/api/sessions/${currentSessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botMessage)
      });
      const sessionRes3 = await fetch(`${API_URL}/api/sessions/${userId}`);
      const sessions3 = await sessionRes3.json();
      setChatSessions(sessions3);
      const currentSession3 = sessions3.find(s => s._id === currentSessionId);
      setMessages(currentSession3 ? currentSession3.messages : []);
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // Download chat as PDF via Puppeteer server
  const downloadChatAsPdf = async () => {
    if (!messages.length) return;
    const userLabel = user?.firstName || user?.lastName
      ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      : user?.primaryEmailAddress?.emailAddress || user?.emailAddress || 'User';
    const response = await fetch(`${API_URL}/api/export-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userLabel })
    });
    if (!response.ok) {
      alert('Failed to generate PDF.');
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowDownloadOptions(false);
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Mobile Close Button */}
        <div className="sidebar-mobile-header">
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={28} />
          </button>
        </div>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            <Plus size={20} />
            New Chat
          </button>
        </div>
        {/* Chats Heading */}
        <div className="sidebar-chats-heading">Chats</div>
        {/* Sidebar Search */}
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="chat-history">
          {chatSessions
            .filter(session => {
              const userMsgs = session.messages.filter(m => m.sender === 'user');
              let summary = session.title;
              if (userMsgs.length > 0) {
                summary = userMsgs.slice(0, 3).map(m => m.text).join(', ').slice(0, 40) + (userMsgs.length > 3 ? '...' : '');
              }
              return summary.toLowerCase().includes(search.toLowerCase());
            })
            .map(session => {
              const userMsgs = session.messages.filter(m => m.sender === 'user');
              let summary = session.title;
              if (userMsgs.length > 0) {
                summary = userMsgs.slice(0, 3).map(m => m.text).join(', ').slice(0, 40) + (userMsgs.length > 3 ? '...' : '');
              }
              return (
                <div
                  key={session._id}
                  className={`chat-session ${currentSessionId === session._id ? 'active' : ''}`}
                  onClick={() => selectChatSession(session._id)}
                >
                  <MessageSquare size={16} />
                  <span>{summary}</span>
                </div>
              );
            })}
        </div>
        {/* Download Chat Button */}
        <div className="sidebar-download-chat" style={{ padding: '1rem', borderTop: '1px solid #23232b' }}>
          <button
            className="download-chat-btn"
            style={{
              width: '100%',
              padding: '0.6rem 0',
              background: !messages.length ? '#a0aec0' : '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: !messages.length ? 'not-allowed' : 'pointer',
              marginBottom: '0.5rem'
            }}
            onClick={downloadChatAsPdf}
            disabled={!messages.length}
          >
            Download Chat as PDF
          </button>
        </div>
        {/* User Info at Bottom */}
        <div className="sidebar-footer">
          <div className="user-info" onClick={() => openUserProfile()}>
            <div className="user-avatar">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="User" className="avatar-img" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="user-details">
              <div className="user-name">{
                user?.firstName || user?.lastName
                  ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                  : user?.primaryEmailAddress?.emailAddress || user?.emailAddress || ''
              }</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header" style={{ position: 'relative' }}>
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              {/* Hamburger icon: three horizontal lines */}
              <span className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <span className="app-title">Ask Asv</span>
          </div>
          <div className="header-right">
            {user?.publicMetadata?.role === 'admin' && (
              <a href="/admin" className="admin-portal-link" style={{ marginRight: '1.2rem' }}>Admin Portal</a>
            )}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          <div className="messages-container">
            {messages.length === 0 && (
              <ChatBubble sender="bot" text={WELCOME_MSG} />
            )}
            {messages.map((msg, idx) => (
              <ChatBubble key={msg._id || idx} sender={msg.sender} text={msg.text} source={msg.source} confidence={msg.confidence} />
            ))}
            {loading && (
              <div className="typing-indicator">
                <div className="typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <div className="chat-input-container">
          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="chat-input"
            />
            <button
              type="button"
              onClick={handleMicClick}
              className={`mic-button${listening ? ' listening' : ''}`}
              aria-label={listening ? 'Stop listening' : 'Start voice input'}
              style={{
                background: listening ? 'linear-gradient(135deg, #667eea 0%, #ff4b2b 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: 'white',
                outline: listening ? '2px solid #ff4b2b' : 'none',
              }}
              disabled={loading}
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="send-button"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  // Social links (LinkedIn, GitHub, Gmail order)
  const socialLinks = [
    {
      href: 'https://linkedin.com/in/adadasaivenkat',
      label: 'LinkedIn',
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#0077B5" d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" /></svg>
      )
    },
    {
      href: 'https://github.com/adadasaivenkat',
      label: 'GitHub',
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 0c-6.63 0-12 5.37-12 12 0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.218.694.825.576 4.765-1.587 8.2-6.086 8.2-11.385 0-6.63-5.37-12-12-12z" /></svg>
      )
    },
    {
      href: 'mailto:adadasaivenkat0109@gmail.com',
      label: 'Gmail',
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 13.065l-8-6.065v10.5c0 .828.672 1.5 1.5 1.5h13c.828 0 1.5-.672 1.5-1.5v-10.5l-8 6.065z" /><path fill="#34A853" d="M21.5 4.5h-19c-.828 0-1.5.672-1.5 1.5v.765l10 7.5 10-7.5v-.765c0-.828-.672-1.5-1.5-1.5z" /><path fill="#FBBC05" d="M3.5 4.5l8.5 6.375 8.5-6.375h-17z" /><path fill="#4285F4" d="M21.5 4.5h-19c-.828 0-1.5.672-1.5 1.5v12c0 .828.672 1.5 1.5 1.5h19c.828 0 1.5-.672 1.5-1.5v-12c0-.828-.672-1.5-1.5-1.5zm0 13.5h-19v-10.5l8.5 6.375c.19.143.42.225.66.225s.47-.082.66-.225l8.5-6.375v10.5z" /></svg>
      )
    }
  ];

  const clerkAppearance = {
    elements: {
      card: "login-card",
      headerTitle: "login-header-title",
      formButtonPrimary: "login-button",
      footerAction: { display: "none" },
      footerActionLink: { display: "none" },
      footer: { display: "none" }
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {isSignUp ? (
            <SignUp
              routing="virtual"
              appearance={clerkAppearance}
              afterSignUpUrl="/"
              redirectUrl="/"
              signInUrl=""
            />
          ) : (
            <SignIn
              routing="virtual"
              appearance={clerkAppearance}
              afterSignInUrl="/"
              redirectUrl="/"
              signUpUrl=""
            />
          )}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="auth-toggle-btn"
              style={{
                fontSize: '0.9rem',
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                outline: 'none',
              }}
              onMouseOver={e => e.currentTarget.style.border = 'none'}
              onFocus={e => e.currentTarget.style.border = 'none'}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
        {/* Social Links above copyright */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '2rem'
        }}>
          {socialLinks.map((link, idx) => (
            <div key={link.label} style={{ position: 'relative', display: 'inline-block' }}>
              <a
                href={link.href}
                {...(link.label === 'Gmail' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                style={{ color: 'inherit', textDecoration: 'none', fontSize: '1rem' }}
                onMouseEnter={e => {
                  const tooltip = e.currentTarget.nextSibling;
                  if (tooltip) tooltip.style.opacity = 1;
                }}
                onMouseLeave={e => {
                  const tooltip = e.currentTarget.nextSibling;
                  if (tooltip) tooltip.style.opacity = 0;
                }}
              >
                {React.cloneElement(link.icon, { width: 16, height: 16 })}
              </a>
              {/* Tooltip */}
              <span
                style={{
                  opacity: 0,
                  pointerEvents: 'none',
                  position: 'absolute',
                  bottom: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#23232b',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  transition: 'opacity 0.18s',
                  zIndex: 1001,
                  marginBottom: '0.5rem',
                }}
              >
                {link.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{
          width: '100%',
          textAlign: 'center',
          marginTop: 0,
          color: '#a0aec0',
          fontSize: '0.95rem',
          opacity: 0.8
        }}>
          © {new Date().getFullYear()} Ask Asv. All rights reserved.
        </div>
      </div>
    </>
  );
};

const App = () => {
  const { user } = useUser();

  return (
    <Router>
      <div className="app-root">
        <SignedOut>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <span className="app-title-bold">Ask Asv</span>
          </div>
          <LoginPage />
        </SignedOut>
        <SignedIn>
          <Routes>
            <Route path="/" element={user && <ChatUI userId={user.id} />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </SignedIn>
      </div>
    </Router>
  );
};

export default App;