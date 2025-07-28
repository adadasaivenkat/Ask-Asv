import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

const API_URL = import.meta.env.VITE_API_URL;

const ChatUI = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);
  const { user } = useUser();

  // Fix for mobile viewport height issues with keyboard
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setVH();

    // Update on resize
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Set sidebar open by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Open sidebar by default on desktop
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Fix for mobile viewport height issues with keyboard
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setVH();

    // Update on resize
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  const createNewChat = async () => {
    // Check for an existing empty session (no user or bot messages)
    const emptySession = chatSessions.find(
      s => (!s.messages || s.messages.length === 0)
    );
    if (emptySession) {
      setCurrentSessionId(emptySession._id);
      setMessages([]);
      // Don't automatically close sidebar - let user close it manually
      setCreatingSession(false);
      return;
    }
    // Otherwise, create a new session
    const res = await fetch(`${API_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title: 'New Chat' })
    });
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
    // Don't automatically close sidebar - let user close it manually
    setCreatingSession(false);
  };

  const selectChatSession = (sessionId) => {
    const session = chatSessions.find(s => s._id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      // Don't automatically close sidebar - let user close it manually
      // This allows for better search experience on mobile
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!currentSessionId) return;

    const userMessage = {
      sender: 'user',
      text: messageText,
    };

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

    // Call AI API
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: messageText })
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data = await res.json();
      
      // Add AI response to backend session
      await fetch(`${API_URL}/api/sessions/${currentSessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'bot',
          text: data.reply,
        })
      });

      // Get updated session
      const updatedSessionRes = await fetch(`${API_URL}/api/sessions/${userId}`);
      const updatedSessions = await updatedSessionRes.json();
      setChatSessions(updatedSessions);
      const updatedCurrentSession = updatedSessions.find(s => s._id === currentSessionId);
      setMessages(updatedCurrentSession ? updatedCurrentSession.messages : []);

    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage = {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      
      await fetch(`${API_URL}/api/sessions/${currentSessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorMessage)
      });

      // Get updated session
      const errorSessionRes = await fetch(`${API_URL}/api/sessions/${userId}`);
      const errorSessions = await errorSessionRes.json();
      setChatSessions(errorSessions);
      const errorCurrentSession = errorSessions.find(s => s._id === currentSessionId);
      setMessages(errorCurrentSession ? errorCurrentSession.messages : []);
    } finally {
      setLoading(false);
    }
  };

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
  };

  const toggleSidebar = () => {
    console.log('Toggle sidebar clicked, current state:', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen w-full flex bg-background text-foreground relative">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectChatSession}
        onCreateNewChat={createNewChat}
        search={search}
        onSearchChange={setSearch}
        onDownloadChat={downloadChatAsPdf}
        messages={messages}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64 xl:ml-72' : 'lg:ml-0'
      }`}>
        {/* Header fixed at top */}
        <div className={`fixed top-0 left-0 right-0 z-50 bg-background border-b shadow transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:left-64 xl:left-72' : ''
        }`}>
          <Header 
            onToggleSidebar={() => setSidebarOpen(true)} 
            sidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
          />
        </div>
        {/* Scrollable chat window */}
        <div className="flex-1 min-h-0 overflow-y-auto pt-[80px] pb-[80px]">
          <ChatWindow messages={messages} loading={loading} />
        </div>
        {/* Input fixed at bottom */}
        <div className={`fixed left-0 right-0 bottom-0 z-50 bg-background border-t shadow transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64 xl:ml-72' : 'lg:ml-0'
        }`}>
          <ChatInput onSendMessage={handleSendMessage} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default ChatUI;