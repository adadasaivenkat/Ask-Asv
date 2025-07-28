import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ChatInput = ({ onSendMessage, loading }) => {
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    onSendMessage(input.trim());
    setInput('');
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

  return (
    <div className="p-3 sm:p-4 border-t bg-card">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleMicClick}
            className={`${listening ? 'bg-destructive text-destructive-foreground' : ''} px-3`}
            aria-label={listening ? 'Stop listening' : 'Start voice input'}
            disabled={loading}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            className="px-3"
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;