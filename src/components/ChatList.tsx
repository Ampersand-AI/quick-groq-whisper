
import React, { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import ChatMessage from './ChatMessage';
import { format } from 'date-fns';

const ChatList: React.FC = () => {
  const { state } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date();
  const formattedDate = format(currentDate, "MMMM d, yyyy 'at' h:mm a");
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);
  
  if (state.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Welcome, User
        </h2>
        <p className="text-xs mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          {formattedDate}
        </p>
        <p className="text-muted-foreground max-w-md">
          This is a minimalist chat interface powered by {state.usingFallback ? "Gemini" : "Groq"} API. 
          Start typing below to chat with an AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto white-gradient-mask">
      {state.messages.map((message, index) => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          isLatest={index === state.messages.length - 1}
        />
      ))}
      
      {state.isLoading && (
        <div className="py-6 border-b border-border bg-secondary/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="h-5 w-5 text-primary flex items-center justify-center">
                  <div className="typing-indicator flex">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full mx-0.5"></span>
                    <span className="h-1.5 w-1.5 bg-primary rounded-full mx-0.5"></span>
                    <span className="h-1.5 w-1.5 bg-primary rounded-full mx-0.5"></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium">AI is thinking...</div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatList;
