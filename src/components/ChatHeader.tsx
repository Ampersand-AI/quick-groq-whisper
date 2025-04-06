
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Settings, RefreshCw, Trash } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ChatHeader: React.FC = () => {
  const { 
    state, 
    resetTokenCount, 
    setApiKey, 
    setGeminiApiKey,
    setOpenAIApiKey,
    setClaudeApiKey,
    setDeepSeekApiKey,
    clearConversation, 
    apiKey, 
    geminiApiKey,
    openaiApiKey,
    claudeApiKey,
    deepseekApiKey
  } = useChat();
  
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState(apiKey || '');
  const [newGeminiApiKey, setNewGeminiApiKey] = useState(geminiApiKey || '');
  const [newOpenAIApiKey, setNewOpenAIApiKey] = useState(openaiApiKey || '');
  const [newClaudeApiKey, setNewClaudeApiKey] = useState(claudeApiKey || '');
  const [newDeepSeekApiKey, setNewDeepSeekApiKey] = useState(deepseekApiKey || '');
  
  const handleSaveApiKeys = () => {
    if (newApiKey !== apiKey) {
      setApiKey(newApiKey);
    }
    
    if (newGeminiApiKey !== geminiApiKey) {
      setGeminiApiKey(newGeminiApiKey);
    }

    if (newOpenAIApiKey !== openaiApiKey) {
      setOpenAIApiKey(newOpenAIApiKey);
    }

    if (newClaudeApiKey !== claudeApiKey) {
      setClaudeApiKey(newClaudeApiKey);
    }

    if (newDeepSeekApiKey !== deepseekApiKey) {
      setDeepSeekApiKey(newDeepSeekApiKey);
    }
    
    setApiDialogOpen(false);
  };

  return (
    <header className="border-b border-border sticky top-0 bg-background z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          NeuralVibe
          {state.usingFallback && <span className="text-xs ml-2 text-muted-foreground">(Fallback)</span>}
        </h1>
        
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
              Configure your API keys for NeuralVibe.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="groq">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="groq">Groq</TabsTrigger>
              <TabsTrigger value="gemini">Gemini</TabsTrigger>
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="claude">Claude</TabsTrigger>
              <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
            </TabsList>
            
            <TabsContent value="groq" className="py-4">
              <Label htmlFor="groq-api-key">Groq API Key</Label>
              <Input 
                id="groq-api-key" 
                value={newApiKey} 
                onChange={(e) => setNewApiKey(e.target.value)} 
                placeholder="Enter your Groq API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline">Groq Console</a>
              </p>
            </TabsContent>
            
            <TabsContent value="gemini" className="py-4">
              <Label htmlFor="gemini-api-key">Gemini API Key</Label>
              <Input 
                id="gemini-api-key" 
                value={newGeminiApiKey} 
                onChange={(e) => setNewGeminiApiKey(e.target.value)} 
                placeholder="Enter your Gemini API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">Google AI Studio</a>
              </p>
            </TabsContent>

            <TabsContent value="openai" className="py-4">
              <Label htmlFor="openai-api-key">OpenAI API Key</Label>
              <Input 
                id="openai-api-key" 
                value={newOpenAIApiKey} 
                onChange={(e) => setNewOpenAIApiKey(e.target.value)} 
                placeholder="Enter your OpenAI API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline">OpenAI Platform</a>
              </p>
            </TabsContent>

            <TabsContent value="claude" className="py-4">
              <Label htmlFor="claude-api-key">Claude API Key</Label>
              <Input 
                id="claude-api-key" 
                value={newClaudeApiKey} 
                onChange={(e) => setNewClaudeApiKey(e.target.value)} 
                placeholder="Enter your Claude API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can get your API key from <a href="https://console.anthropic.com/keys" target="_blank" rel="noreferrer" className="underline">Anthropic Console</a>
              </p>
            </TabsContent>

            <TabsContent value="deepseek" className="py-4">
              <Label htmlFor="deepseek-api-key">DeepSeek API Key</Label>
              <Input 
                id="deepseek-api-key" 
                value={newDeepSeekApiKey} 
                onChange={(e) => setNewDeepSeekApiKey(e.target.value)} 
                placeholder="Enter your DeepSeek API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can get your API key from <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="underline">DeepSeek Platform</a>
              </p>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button onClick={() => setApiDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSaveApiKeys}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default ChatHeader;
