
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
import { Settings, RefreshCw, Trash, Key, Trash2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

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
  const [apiKeys, setApiKeys] = useState({
    groq: apiKey || '',
    gemini: geminiApiKey || '',
    openai: openaiApiKey || '',
    claude: claudeApiKey || '',
    deepseek: deepseekApiKey || ''
  });
  
  const handleSaveApiKeys = () => {
    if (apiKeys.groq !== apiKey) {
      setApiKey(apiKeys.groq);
    }
    
    if (apiKeys.gemini !== geminiApiKey) {
      setGeminiApiKey(apiKeys.gemini);
    }

    if (apiKeys.openai !== openaiApiKey) {
      setOpenAIApiKey(apiKeys.openai);
    }

    if (apiKeys.claude !== claudeApiKey) {
      setClaudeApiKey(apiKeys.claude);
    }

    if (apiKeys.deepseek !== deepseekApiKey) {
      setDeepSeekApiKey(apiKeys.deepseek);
    }
    
    setApiDialogOpen(false);
  };

  const clearApiKey = (provider: string) => {
    setApiKeys({
      ...apiKeys,
      [provider]: ''
    });
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Keys</DialogTitle>
            <DialogDescription>
              Configure your API keys for NeuralVibe. Missing keys will be skipped during processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            {/* Groq API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="groq-api-key">Groq API Key</Label>
                {apiKeys.groq && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => clearApiKey('groq')}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Groq API Key</span>
                  </Button>
                )}
              </div>
              <Input 
                id="groq-api-key" 
                value={apiKeys.groq} 
                onChange={(e) => setApiKeys({...apiKeys, groq: e.target.value})} 
                placeholder="Enter your Groq API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline">Get Groq API key</a>
              </p>
            </div>

            {/* Gemini API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="gemini-api-key">Gemini API Key</Label>
                {apiKeys.gemini && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => clearApiKey('gemini')}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Gemini API Key</span>
                  </Button>
                )}
              </div>
              <Input 
                id="gemini-api-key" 
                value={apiKeys.gemini} 
                onChange={(e) => setApiKeys({...apiKeys, gemini: e.target.value})} 
                placeholder="Enter your Gemini API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">Get Gemini API key</a>
              </p>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                {apiKeys.openai && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => clearApiKey('openai')}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove OpenAI API Key</span>
                  </Button>
                )}
              </div>
              <Input 
                id="openai-api-key" 
                value={apiKeys.openai} 
                onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})} 
                placeholder="Enter your OpenAI API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline">Get OpenAI API key</a>
              </p>
            </div>

            {/* Claude API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="claude-api-key">Claude API Key</Label>
                {apiKeys.claude && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => clearApiKey('claude')}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Claude API Key</span>
                  </Button>
                )}
              </div>
              <Input 
                id="claude-api-key" 
                value={apiKeys.claude} 
                onChange={(e) => setApiKeys({...apiKeys, claude: e.target.value})} 
                placeholder="Enter your Claude API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                <a href="https://console.anthropic.com/keys" target="_blank" rel="noreferrer" className="underline">Get Claude API key</a>
              </p>
            </div>

            {/* DeepSeek API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="deepseek-api-key">DeepSeek API Key</Label>
                {apiKeys.deepseek && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => clearApiKey('deepseek')}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove DeepSeek API Key</span>
                  </Button>
                )}
              </div>
              <Input 
                id="deepseek-api-key" 
                value={apiKeys.deepseek} 
                onChange={(e) => setApiKeys({...apiKeys, deepseek: e.target.value})} 
                placeholder="Enter your DeepSeek API key"
                className="mt-1"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="underline">Get DeepSeek API key</a>
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setApiDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSaveApiKeys}>Save All Keys</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default ChatHeader;
