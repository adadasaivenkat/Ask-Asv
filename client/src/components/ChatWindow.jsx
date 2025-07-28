import React, { useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';

const ChatWindow = ({ messages, loading }) => {
  const chatEndRef = useRef(null);
  const WELCOME_MSG = "Hello! I'm Asv, your AI assistant. How can I help you today?";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <ChatBubble sender="bot" text={WELCOME_MSG} />
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatBubble 
                key={msg._id || idx} 
                sender={msg.sender} 
                text={msg.text} 
                source={msg.source} 
                confidence={msg.confidence} 
              />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;