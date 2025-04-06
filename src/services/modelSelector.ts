
import { Message } from "@/types/chat";

// Domain-based keywords to help determine the best model
type DomainKeywords = {
  [key: string]: string[];
};

const domainKeywords: DomainKeywords = {
  coding: ['code', 'programming', 'javascript', 'python', 'algorithm', 'function', 'class', 'api'],
  math: ['math', 'equation', 'algebra', 'calculus', 'geometry', 'theorem', 'numeric'],
  creative: ['story', 'poem', 'creative', 'imagine', 'fiction', 'narrative', 'character'],
  analytical: ['analyze', 'research', 'study', 'comparison', 'evaluation', 'assessment'],
  scientific: ['science', 'physics', 'chemistry', 'biology', 'scientific', 'experiment']
};

export type ModelProvider = 'groq' | 'gemini' | 'openai' | 'claude' | 'deepseek';

export class ModelSelector {
  // Map domains to preferred providers
  private domainToProviderMap: Record<string, ModelProvider[]> = {
    coding: ['openai', 'groq', 'deepseek'], // OpenAI and DeepSeek are good for code
    math: ['claude', 'openai', 'groq'],     // Claude handles math well
    creative: ['openai', 'claude', 'groq'],  // OpenAI good for creative tasks
    analytical: ['claude', 'openai', 'groq'], // Claude good for analysis
    scientific: ['deepseek', 'claude', 'openai'] // DeepSeek good for scientific content
  };

  // Default providers in order of preference if no specific domain matches
  private defaultProviders: ModelProvider[] = ['groq', 'openai', 'claude', 'deepseek', 'gemini'];

  // Select a model based on available API keys and message content
  selectModel(
    messages: Message[], 
    availableProviders: ModelProvider[]
  ): { provider: ModelProvider; reason: string } {
    if (availableProviders.length === 0) {
      throw new Error("No API providers available");
    }
    
    // For very short conversations, use the default provider
    if (messages.length <= 1) {
      const provider = this.getFirstAvailable(availableProviders);
      return { 
        provider, 
        reason: "Initial conversation" 
      };
    }

    // Get the most recent user message
    const latestUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'user')?.content || '';
    
    // Determine the domain based on keywords in the message
    const detectedDomain = this.detectDomain(latestUserMessage);
    
    if (detectedDomain) {
      // Get preferred providers for this domain
      const preferredProviders = this.domainToProviderMap[detectedDomain] || this.defaultProviders;
      
      // Find the first available preferred provider
      for (const provider of preferredProviders) {
        if (availableProviders.includes(provider)) {
          return { 
            provider, 
            reason: `Best for ${detectedDomain} content`
          };
        }
      }
    }
    
    // Fallback to first available provider
    const provider = this.getFirstAvailable(availableProviders);
    return { 
      provider, 
      reason: "Default selection" 
    };
  }

  // Detect the domain based on message content
  private detectDomain(message: string): string | null {
    // Convert message to lowercase
    const lowerMessage = message.toLowerCase();
    
    // Calculate scores for each domain
    const scores: Record<string, number> = {};
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      scores[domain] = 0;
      
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerMessage.match(regex) || [];
        scores[domain] += matches.length;
      }
    }
    
    // Find domain with highest score
    let maxScore = 0;
    let bestDomain: string | null = null;
    
    for (const [domain, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestDomain = domain;
      }
    }
    
    // Only return a domain if we have a meaningful match
    return maxScore > 0 ? bestDomain : null;
  }
  
  // Get the first available provider from the list
  private getFirstAvailable(availableProviders: ModelProvider[]): ModelProvider {
    return availableProviders[0] || 'groq';
  }
}

export const modelSelector = new ModelSelector();
