
import { ApiResponse, Message } from "@/types/chat";

export class GroqService {
  private apiKey: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('groq_api_key', key);
  }

  getApiKey(): string {
    if (!this.apiKey) {
      const savedKey = localStorage.getItem('groq_api_key');
      if (savedKey) {
        this.apiKey = savedKey;
      }
    }
    return this.apiKey;
  }

  async chat(messages: Message[], model: string): Promise<ApiResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("Groq API key is required");
    }

    // Map model ID to valid Groq model ID
    let groqModel = model;
    if (model === 'mixtral-8x7b-32768') {
      // Use LLaMA 3 as replacement for deprecated Mixtral
      groqModel = 'llama3-70b-8192';
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: groqModel,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'An error occurred with the Groq API');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error calling Groq API:', error);
      throw new Error(`Groq API error: ${error.message || 'Unknown error'}`);
    }
  }
}

export const groqService = new GroqService();
