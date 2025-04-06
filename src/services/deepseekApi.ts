
import { ApiResponse, Message } from "@/types/chat";

export class DeepSeekService {
  private apiKey: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('deepseek_api_key', key);
  }

  getApiKey(): string {
    if (!this.apiKey) {
      const savedKey = localStorage.getItem('deepseek_api_key');
      if (savedKey) {
        this.apiKey = savedKey;
      }
    }
    return this.apiKey;
  }

  async chat(messages: Message[], model: string): Promise<ApiResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("DeepSeek API key is required");
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || "deepseek-chat",
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'An error occurred with the DeepSeek API');
      }

      const data = await response.json();
      
      return {
        id: data.id,
        object: data.object,
        created: data.created,
        model: data.model,
        choices: data.choices,
        usage: data.usage
      };
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw error;
    }
  }
}

export const deepseekService = new DeepSeekService();
