
import React, { useEffect, useState } from 'react';
import ChatHeader from '@/components/ChatHeader';
import ChatList from '@/components/ChatList';
import ChatInput from '@/components/ChatInput';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ApiKeyForm: React.FC<{ onSubmit: (key: string) => void }> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-card border border-border rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Welcome to NeuralVibe</h1>
        <p className="mb-4 text-muted-foreground">
          To get started, please enter your Groq API key.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(apiKey); }}>
          <Input
            type="password"
            placeholder="Enter your Groq API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mb-4"
          />
          <p className="text-xs text-muted-foreground mb-4">
            You can get your API key from{' '}
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline">
              Groq Console
            </a>
          </p>
          <Button type="submit" className="w-full" disabled={!apiKey}>
            Start Chatting
          </Button>
        </form>
      </div>
    </div>
  );
};

const ChatScreen: React.FC = () => {
  const { apiKey, setApiKey } = useChat();
  
  if (!apiKey) {
    return <ApiKeyForm onSubmit={setApiKey} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatHeader />
      <ChatList />
      <ChatInput />
    </div>
  );
};

const ChatApp: React.FC = () => {
  return (
    <ChatProvider>
      <ChatScreen />
    </ChatProvider>
  );
};

export default ChatApp;
