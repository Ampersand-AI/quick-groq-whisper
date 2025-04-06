
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, ChevronDown, RefreshCw, Trash } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { ModelOption, AVAILABLE_MODELS } from '@/types/chat';

const ChatHeader: React.FC = () => {
  const { state, resetTokenCount, changeModel, setApiKey, clearConversation, apiKey } = useChat();
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState(apiKey || '');
  
  const handleModelChange = (model: ModelOption) => {
    changeModel(model);
  };
  
  const handleSaveApiKey = () => {
    setApiKey(newApiKey);
    setApiDialogOpen(false);
  };

  return (
    <header className="border-b border-border sticky top-0 bg-background z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Groq Chat</h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetTokenCount}
            className="hidden sm:flex"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Reset Tokens
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearConversation}
            className="hidden sm:flex"
          >
            <Trash className="h-3 w-3 mr-2" />
            Clear Chat
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {state.model.name}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Model</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AVAILABLE_MODELS.map(model => (
                <DropdownMenuItem 
                  key={model.id}
                  onClick={() => handleModelChange(model)}
                  className="flex flex-col items-start"
                >
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setApiDialogOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={apiDialogOpen} onOpenChange={setApiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Settings</DialogTitle>
            <DialogDescription>
              Enter your Groq API key to use this chat application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="api-key">API Key</Label>
            <Input 
              id="api-key" 
              value={newApiKey} 
              onChange={(e) => setNewApiKey(e.target.value)} 
              placeholder="Enter your Groq API key"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You can get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline">Groq Console</a>
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setApiDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSaveApiKey}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default ChatHeader;
