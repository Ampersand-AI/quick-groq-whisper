
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, state } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTokenLimitReached = state.tokenCount.remaining <= 0 && !state.usingFallback;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !state.isLoading) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto px-4 sm:px-6 py-4">
      <div className="relative flex items-center">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isTokenLimitReached 
              ? "Groq token limit reached. Set Gemini API key as fallback." 
              : "Type a message..."
          }
          className="pr-12 min-h-[50px] max-h-[200px] resize-none"
          disabled={state.isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          disabled={!message.trim() || state.isLoading}
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mt-2 flex justify-between">
        <div>
          {state.usingFallback ? (
            <span className="text-amber-500">Using Gemini API (fallback)</span>
          ) : isTokenLimitReached ? (
            <span className="text-destructive">Groq token limit reached</span>
          ) : (
            <span>Tokens remaining: {state.tokenCount.remaining.toLocaleString()} of {state.tokenCount.limit.toLocaleString()}</span>
          )}
        </div>
        <div>
          Total used: {state.tokenCount.total.toLocaleString()}
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
