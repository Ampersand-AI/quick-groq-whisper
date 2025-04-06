
export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  tokenCount: {
    total: number;
    remaining: number;
    limit: number;
  };
  model: ModelOption;
  activeProvider: ModelProvider;
  lastProvider?: ModelProvider;
  usingFallback: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  value: string;
  description: string;
  maxTokens: number;
}

export interface ApiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    logprobs: null;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export type ModelProvider = 'groq' | 'gemini' | 'openai' | 'claude' | 'deepseek';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    value: 'mixtral-8x7b-32768',
    description: 'A powerful open-source mixture-of-experts model',
    maxTokens: 32768,
  },
  {
    id: 'llama3',
    name: 'LLaMA 3',
    value: 'llama3-8b-8192',
    description: 'Meta\'s optimized 8B parameter model',
    maxTokens: 8192,
  },
  {
    id: 'gpt4o',
    name: 'GPT-4o',
    value: 'gpt-4o',
    description: 'OpenAI\'s most capable multimodal model',
    maxTokens: 8192,
  },
  {
    id: 'claude3',
    name: 'Claude 3 Opus',
    value: 'claude-3-opus-20240229',
    description: 'Anthropic\'s most capable language model',
    maxTokens: 4096,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Chat',
    value: 'deepseek-chat',
    description: 'DeepSeek\'s large language model',
    maxTokens: 4096,
  },
];
