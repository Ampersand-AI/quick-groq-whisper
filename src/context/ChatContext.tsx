
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { ChatState, Message, ModelOption, ModelProvider, AVAILABLE_MODELS } from '@/types/chat';
import { groqService } from '@/services/api';
import { geminiService } from '@/services/geminiApi';
import { openaiService } from '@/services/openaiApi';
import { claudeService } from '@/services/claudeApi';
import { deepseekService } from '@/services/deepseekApi';
import { modelSelector } from '@/services/modelSelector';
import { toast } from 'sonner';

const TOKEN_LIMIT = 500000;

type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; payload: Message }
  | { type: 'ADD_ASSISTANT_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_TOKEN_COUNT'; payload: { prompt: number; completion: number } }
  | { type: 'RESET_TOKEN_COUNT' }
  | { type: 'CHANGE_MODEL'; payload: ModelOption }
  | { type: 'SET_ACTIVE_PROVIDER'; payload: ModelProvider }
  | { type: 'SET_USING_FALLBACK'; payload: boolean }
  | { type: 'CLEAR_CONVERSATION' };

interface ChatContextProps {
  state: ChatState;
  sendMessage: (content: string) => Promise<void>;
  resetTokenCount: () => void;
  changeModel: (model: ModelOption) => void;
  setApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  setOpenAIApiKey: (key: string) => void;
  setClaudeApiKey: (key: string) => void;
  setDeepSeekApiKey: (key: string) => void;
  clearConversation: () => void;
  apiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
  claudeApiKey: string;
  deepseekApiKey: string;
}

const defaultState: ChatState = {
  messages: [],
  isLoading: false,
  tokenCount: {
    total: 0,
    remaining: TOKEN_LIMIT,
    limit: TOKEN_LIMIT,
  },
  model: AVAILABLE_MODELS[0],
  activeProvider: 'groq',
  usingFallback: false
};

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'ADD_ASSISTANT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_TOKEN_COUNT': {
      const totalTokens = action.payload.prompt + action.payload.completion;
      return {
        ...state,
        tokenCount: {
          ...state.tokenCount,
          total: state.tokenCount.total + totalTokens,
          remaining: Math.max(0, state.tokenCount.remaining - totalTokens),
        },
      };
    }
    case 'RESET_TOKEN_COUNT':
      return {
        ...state,
        tokenCount: {
          ...state.tokenCount,
          total: 0,
          remaining: TOKEN_LIMIT,
        },
        usingFallback: false,
      };
    case 'CHANGE_MODEL':
      return {
        ...state,
        model: action.payload,
      };
    case 'SET_ACTIVE_PROVIDER':
      return {
        ...state,
        activeProvider: action.payload,
        lastProvider: state.activeProvider,
      };
    case 'SET_USING_FALLBACK':
      return {
        ...state,
        usingFallback: action.payload,
      };
      
    case 'CLEAR_CONVERSATION':
      return {
        ...state,
        messages: [],
      };
    default:
      return state;
  }
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, defaultState);
  const [apiKey, setApiKeyState] = React.useState<string>(groqService.getApiKey() || '');
  const [geminiApiKey, setGeminiApiKeyState] = React.useState<string>(geminiService.getApiKey() || '');
  const [openaiApiKey, setOpenAIApiKeyState] = React.useState<string>(openaiService.getApiKey() || '');
  const [claudeApiKey, setClaudeApiKeyState] = React.useState<string>(claudeService.getApiKey() || '');
  const [deepseekApiKey, setDeepSeekApiKeyState] = React.useState<string>(deepseekService.getApiKey() || '');
  
  useEffect(() => {
    // Load conversation from localStorage
    const savedConversation = localStorage.getItem('chat_conversation');
    const savedTokenCount = localStorage.getItem('chat_token_count');
    const savedModel = localStorage.getItem('chat_model');
    const savedUsingFallback = localStorage.getItem('chat_using_fallback');
    const savedActiveProvider = localStorage.getItem('chat_active_provider');
    
    if (savedConversation) {
      try {
        const messages = JSON.parse(savedConversation) as Message[];
        messages.forEach(message => {
          if (message.role === 'user') {
            dispatch({ type: 'ADD_USER_MESSAGE', payload: message });
          } else if (message.role === 'assistant') {
            dispatch({ type: 'ADD_ASSISTANT_MESSAGE', payload: message });
          }
        });
      } catch (error) {
        console.error('Error parsing saved conversation:', error);
      }
    }

    if (savedTokenCount) {
      try {
        const tokenCount = JSON.parse(savedTokenCount);
        dispatch({ 
          type: 'UPDATE_TOKEN_COUNT', 
          payload: { 
            prompt: tokenCount.total, 
            completion: 0 
          } 
        });
      } catch (error) {
        console.error('Error parsing saved token count:', error);
      }
    }

    if (savedModel) {
      try {
        const model = JSON.parse(savedModel) as ModelOption;
        const foundModel = AVAILABLE_MODELS.find(m => m.id === model.id);
        if (foundModel) {
          dispatch({ type: 'CHANGE_MODEL', payload: foundModel });
        }
      } catch (error) {
        console.error('Error parsing saved model:', error);
      }
    }

    if (savedActiveProvider) {
      try {
        const activeProvider = JSON.parse(savedActiveProvider) as ModelProvider;
        dispatch({ type: 'SET_ACTIVE_PROVIDER', payload: activeProvider });
      } catch (error) {
        console.error('Error parsing saved active provider:', error);
      }
    }

    if (savedUsingFallback) {
      try {
        const usingFallback = JSON.parse(savedUsingFallback) as boolean;
        dispatch({ type: 'SET_USING_FALLBACK', payload: usingFallback });
      } catch (error) {
        console.error('Error parsing saved fallback status:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save conversation to localStorage whenever it changes
    if (state.messages.length > 0) {
      localStorage.setItem('chat_conversation', JSON.stringify(state.messages));
      localStorage.setItem('chat_token_count', JSON.stringify(state.tokenCount));
      localStorage.setItem('chat_model', JSON.stringify(state.model));
      localStorage.setItem('chat_using_fallback', JSON.stringify(state.usingFallback));
      localStorage.setItem('chat_active_provider', JSON.stringify(state.activeProvider));
    }
  }, [state.messages, state.tokenCount, state.model, state.usingFallback, state.activeProvider]);

  const setApiKey = (key: string) => {
    groqService.setApiKey(key);
    setApiKeyState(key);
    toast.success('Groq API key saved');
  };

  const setGeminiApiKey = (key: string) => {
    geminiService.setApiKey(key);
    setGeminiApiKeyState(key);
    toast.success('Gemini API key saved');
  };

  const setOpenAIApiKey = (key: string) => {
    openaiService.setApiKey(key);
    setOpenAIApiKeyState(key);
    toast.success('OpenAI API key saved');
  };

  const setClaudeApiKey = (key: string) => {
    claudeService.setApiKey(key);
    setClaudeApiKeyState(key);
    toast.success('Claude API key saved');
  };

  const setDeepSeekApiKey = (key: string) => {
    deepseekService.setApiKey(key);
    setDeepSeekApiKeyState(key);
    toast.success('DeepSeek API key saved');
  };

  const sendMessage = async (content: string) => {
    // Check for available providers
    const availableProviders: ModelProvider[] = [];
    if (apiKey) availableProviders.push('groq');
    if (geminiApiKey) availableProviders.push('gemini');
    if (openaiApiKey) availableProviders.push('openai');
    if (claudeApiKey) availableProviders.push('claude');
    if (deepseekApiKey) availableProviders.push('deepseek');

    if (availableProviders.length === 0) {
      toast.error('No API keys configured. Please add at least one API key.');
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    dispatch({ type: 'ADD_USER_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Prepare messages for the API (including system message and history)
      const messagesToSend: Message[] = [
        {
          id: 'system',
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, concise and accurate responses.',
          timestamp: 0
        },
        ...state.messages.slice(-10), // Take the last 10 messages for context
        userMessage
      ];

      // Determine the best provider for this message
      const { provider, reason } = modelSelector.selectModel(
        [...state.messages, userMessage],
        availableProviders
      );
      
      dispatch({ type: 'SET_ACTIVE_PROVIDER', payload: provider });
      
      // Show toast with model selection
      toast.info(`Using ${provider.toUpperCase()} for this message`, {
        description: reason
      });

      // Select appropriate model for the provider
      let selectedModel = state.model;
      if (provider === 'openai') {
        selectedModel = AVAILABLE_MODELS.find(m => m.id === 'gpt4o') || selectedModel;
      } else if (provider === 'claude') {
        selectedModel = AVAILABLE_MODELS.find(m => m.id === 'claude3') || selectedModel;
      } else if (provider === 'deepseek') {
        selectedModel = AVAILABLE_MODELS.find(m => m.id === 'deepseek') || selectedModel;
      }

      // Use the appropriate service based on the provider
      let response;
      switch (provider) {
        case 'groq':
          response = await groqService.chat(messagesToSend, state.model.value);
          break;
        case 'gemini':
          response = await geminiService.chat(messagesToSend, state.model.value);
          break;
        case 'openai':
          response = await openaiService.chat(messagesToSend, selectedModel.value);
          break;
        case 'claude':
          response = await claudeService.chat(messagesToSend, selectedModel.value);
          break;
        case 'deepseek':
          response = await deepseekService.chat(messagesToSend, selectedModel.value);
          break;
        default:
          throw new Error('Unknown provider');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.choices[0].message.content,
        timestamp: Date.now(),
        tokens: {
          prompt: response.usage.prompt_tokens,
          completion: response.usage.completion_tokens,
          total: response.usage.total_tokens
        }
      };

      dispatch({ type: 'ADD_ASSISTANT_MESSAGE', payload: assistantMessage });
      
      // Only update token count if using Groq (primary)
      if (provider === 'groq') {
        dispatch({ 
          type: 'UPDATE_TOKEN_COUNT', 
          payload: { 
            prompt: response.usage.prompt_tokens, 
            completion: response.usage.completion_tokens 
          } 
        });
      }
      
      // Set fallback flag if we're not using Groq
      if (provider !== 'groq') {
        dispatch({ type: 'SET_USING_FALLBACK', payload: true });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to get response');
      console.error('Error sending message:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetTokenCount = () => {
    dispatch({ type: 'RESET_TOKEN_COUNT' });
    dispatch({ type: 'SET_USING_FALLBACK', payload: false });
    toast.success('Token count reset');
  };

  const changeModel = (model: ModelOption) => {
    dispatch({ type: 'CHANGE_MODEL', payload: model });
    toast.success(`Model changed to ${model.name}`);
  };

  const clearConversation = () => {
    dispatch({ type: 'CLEAR_CONVERSATION' });
    localStorage.removeItem('chat_conversation');
    toast.success('Conversation cleared');
  };

  return (
    <ChatContext.Provider 
      value={{ 
        state, 
        sendMessage, 
        resetTokenCount, 
        changeModel, 
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
