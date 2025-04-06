
import { ApiResponse, Message } from "@/types/chat";

export class ClaudeService {
  private apiKey: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('claude_api_key', key);
  }

  getApiKey(): string {
    if (!this.apiKey) {
      const savedKey = localStorage.getItem('claude_api_key');
      if (savedKey) {
        this.apiKey = savedKey;
      }
    }
    return this.apiKey;
  }

  async chat(messages: Message[], model: string): Promise<ApiResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("Claude API key is required");
    }

    try {
      // Format messages to Claude's format
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || "claude-3-opus-20240229",
          max_tokens: 4000,
          messages: messages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'An error occurred with the Claude API');
      }

      const data = await response.json();
      
      // Convert Claude's response to our standard format
      return {
        id: data.id,
        object: "chat.completion",
        created: Date.now(),
        model: model || "claude-3-opus-20240229",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: data.content[0].text
          },
          logprobs: null,
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: data.usage?.input_tokens || 0,
          completion_tokens: data.usage?.output_tokens || 0,
          total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
}

export const claudeService = new ClaudeService();
