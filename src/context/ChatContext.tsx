
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { ChatState, Message, ModelOption, AVAILABLE_MODELS } from '@/types/chat';
import { groqService } from '@/services/api';
import { toast } from 'sonner';

const TOKEN_LIMIT = 500000;

type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; payload: Message }
  | { type: 'ADD_ASSISTANT_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_TOKEN_COUNT'; payload: { prompt: number; completion: number } }
  | { type: 'RESET_TOKEN_COUNT' }
  | { type: 'CHANGE_MODEL'; payload: ModelOption }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'CLEAR_CONVERSATION' };

interface ChatContextProps {
  state: ChatState;
  sendMessage: (content: string) => Promise<void>;
  resetTokenCount: () => void;
  changeModel: (model: ModelOption) => void;
  setApiKey: (key: string) => void;
  clearConversation: () => void;
  apiKey: string;
}

const defaultState: ChatState = {
  messages: [],
  isLoading: false,
  tokenCount: {
    total: 0,
    remaining: TOKEN_LIMIT,
    limit: TOKEN_LIMIT,
  },
  model: AVAILABLE_MODELS[0]
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
      };
    case 'CHANGE_MODEL':
      return {
        ...state,
        model: action.payload,
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
  
  useEffect(() => {
    // Load conversation from localStorage
    const savedConversation = localStorage.getItem('chat_conversation');
    const savedTokenCount = localStorage.getItem('chat_token_count');
    const savedModel = localStorage.getItem('chat_model');
    
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
  }, []);

  useEffect(() => {
    // Save conversation to localStorage whenever it changes
    if (state.messages.length > 0) {
      localStorage.setItem('chat_conversation', JSON.stringify(state.messages));
      localStorage.setItem('chat_token_count', JSON.stringify(state.tokenCount));
      localStorage.setItem('chat_model', JSON.stringify(state.model));
    }
  }, [state.messages, state.tokenCount, state.model]);

  const setApiKey = (key: string) => {
    groqService.setApiKey(key);
    setApiKeyState(key);
    toast.success('API key saved');
  };

  const sendMessage = async (content: string) => {
    if (state.tokenCount.remaining <= 0) {
      toast.error('Token limit reached');
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

      const response = await groqService.chat(messagesToSend, state.model.value);

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
      dispatch({ 
        type: 'UPDATE_TOKEN_COUNT', 
        payload: { 
          prompt: response.usage.prompt_tokens, 
          completion: response.usage.completion_tokens 
        } 
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to get response');
      console.error('Error sending message:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetTokenCount = () => {
    dispatch({ type: 'RESET_TOKEN_COUNT' });
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
        clearConversation,
        apiKey
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
