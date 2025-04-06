
import { ApiResponse, Message } from "@/types/chat";

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
  }

  getApiKey(): string {
    if (!this.apiKey) {
      const savedKey = localStorage.getItem('gemini_api_key');
      if (savedKey) {
        this.apiKey = savedKey;
      }
    }
    return this.apiKey;
  }

  async chat(messages: Message[], model: string): Promise<ApiResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    try {
      // Convert messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'An error occurred with the Gemini API');
      }

      const data = await response.json();
      
      // Convert Gemini response to our ApiResponse format
      return {
        id: data.candidates[0].content.parts[0].text.substring(0, 10),
        object: "chat.completion",
        created: Date.now(),
        model: model || "gemini-1.5-pro",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: data.candidates[0].content.parts[0].text
          },
          logprobs: null,
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
          completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: (data.usageMetadata?.promptTokenCount || 0) + (data.usageMetadata?.candidatesTokenCount || 0)
        }
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
