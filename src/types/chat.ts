
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
];
