
import { ApiResponse, Message } from "@/types/chat";

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  getApiKey(): string {
    if (!this.apiKey) {
      const savedKey = localStorage.getItem('openai_api_key');
      if (savedKey) {
        this.apiKey = savedKey;
      }
    }
    return this.apiKey;
  }

  async chat(messages: Message[], model: string): Promise<ApiResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || "gpt-4o",
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'An error occurred with the OpenAI API');
      }

      const data = await response.json();
      
      return {
        id: data.id,
        object: data.object,
        created: data.created,
        model: data.model,
        choices: data.choices,
        usage: {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();
