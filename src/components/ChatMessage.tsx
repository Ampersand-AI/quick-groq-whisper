
import React from 'react';
import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest }) => {
  const isUser = message.role === 'user';
  const tokenInfo = message.tokens;

  return (
    <div 
      className={cn(
        "py-6 border-b border-border message-appear",
        isUser ? "bg-background" : "bg-secondary/40"
      )}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-4">
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap mb-2">{message.content}</p>
          </div>
          
          {!isUser && tokenInfo && (
            <div className="text-xs text-muted-foreground mt-2">
              <span className="inline-block mr-3">Prompt tokens: {tokenInfo.prompt}</span>
              <span className="inline-block mr-3">Completion tokens: {tokenInfo.completion}</span>
              <span className="inline-block">Total: {tokenInfo.total}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
