
import { Message } from "@/types/chat";

// Domain-based keywords to help determine the best model
type DomainKeywords = {
  [key: string]: string[];
};

// Enhanced keyword sets for better model selection
const domainKeywords: DomainKeywords = {
  coding: ['code', 'programming', 'javascript', 'python', 'algorithm', 'function', 'class', 'api', 'debug', 'syntax', 'compiler', 'runtime', 'library', 'framework', 'git', 'repository'],
  math: ['math', 'equation', 'algebra', 'calculus', 'geometry', 'theorem', 'numeric', 'polynomial', 'linear', 'matrix', 'vector', 'derivative', 'integral', 'statistics', 'probability'],
  creative: ['story', 'poem', 'creative', 'imagine', 'fiction', 'narrative', 'character', 'plot', 'write', 'novel', 'fantasy', 'create', 'design', 'artistic', 'aesthetic'],
  analytical: ['analyze', 'research', 'study', 'comparison', 'evaluation', 'assessment', 'report', 'review', 'examine', 'investigate', 'critique', 'assess', 'interpret', 'breakdown'],
  scientific: ['science', 'physics', 'chemistry', 'biology', 'scientific', 'experiment', 'hypothesis', 'theory', 'molecule', 'reaction', 'cell', 'organism', 'data', 'observation'],
  philosophical: ['philosophy', 'ethics', 'moral', 'existence', 'consciousness', 'meaning', 'purpose', 'reasoning', 'logic', 'argument', 'debate', 'perspective', 'worldview'],
  business: ['business', 'marketing', 'finance', 'strategy', 'management', 'startup', 'entrepreneur', 'revenue', 'customer', 'product', 'service', 'market', 'competition', 'analysis'],
  educational: ['teach', 'learn', 'explain', 'education', 'concept', 'understand', 'student', 'knowledge', 'curriculum', 'lesson', 'subject', 'topic', 'comprehend', 'clarify']
};

export type ModelProvider = 'groq' | 'gemini' | 'openai' | 'claude' | 'deepseek';

export class ModelSelector {
  // Map domains to preferred providers with more specific assignments
  private domainToProviderMap: Record<string, ModelProvider[]> = {
    coding: ['openai', 'groq', 'deepseek'],     // OpenAI and DeepSeek excel at code
    math: ['claude', 'openai', 'deepseek'],     // Claude has strong math capabilities
    creative: ['openai', 'claude', 'groq'],     // OpenAI is strong for creative content
    analytical: ['claude', 'openai', 'deepseek'], // Claude is excellent for analysis
    scientific: ['deepseek', 'claude', 'openai'], // DeepSeek for scientific content
    philosophical: ['claude', 'openai', 'gemini'], // Claude handles philosophical topics well
    business: ['openai', 'claude', 'groq'],     // OpenAI is strong for business context
    educational: ['openai', 'deepseek', 'gemini']  // OpenAI excels at explanations
  };

  // Default providers in order of preference
  private defaultProviders: ModelProvider[] = ['groq', 'openai', 'claude', 'deepseek', 'gemini'];

  // Linguistic complexity detection for better model routing
  private complexityIndicators = [
    'detailed', 'comprehensive', 'in-depth', 'thorough', 'elaborate', 'nuanced',
    'complex', 'sophisticated', 'advanced', 'intricate', 'technical'
  ];

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

    // Get the most recent user message and conversation history
    const latestUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'user')?.content || '';
      
    // Consider conversation length for more context
    const conversationLength = messages.filter(msg => msg.role === 'user').length;
    
    // Determine the domain based on keywords in the message
    const detectedDomain = this.detectDomain(latestUserMessage);
    
    // Check for complexity indicators
    const isComplex = this.complexityIndicators.some(indicator => 
      latestUserMessage.toLowerCase().includes(indicator)
    );
    
    // Analyze message length as an additional complexity factor
    const isLongPrompt = latestUserMessage.length > 300;
    
    // If complex question, prioritize more advanced models
    if ((isComplex || isLongPrompt) && availableProviders.includes('claude')) {
      return {
        provider: 'claude',
        reason: "Complex question requiring nuanced response"
      };
    }
    
    // Check for code-focused requests with syntax patterns
    if (
      (latestUserMessage.includes('```') || 
       latestUserMessage.includes('function') || 
       latestUserMessage.includes('class') ||
       latestUserMessage.includes('{') && latestUserMessage.includes('}')) && 
      availableProviders.includes('openai')
    ) {
      return {
        provider: 'openai',
        reason: "Code-focused request"
      };
    }
    
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
    
    // For ongoing conversations, try to maintain continuity with the same provider
    // This helps maintain context and conversation flow
    if (conversationLength > 2 && messages.length > 3) {
      const previousResponses = messages.filter(msg => msg.role === 'assistant');
      if (previousResponses.length > 0) {
        // Check for patterns in previous responses that might indicate provider strengths
        const lastResponseQuality = this.assessResponseQuality(previousResponses[previousResponses.length - 1].content);
        if (lastResponseQuality === 'high' && availableProviders.includes('openai')) {
          return {
            provider: 'openai',
            reason: "Continuing high-quality conversation thread"
          };
        }
      }
    }
    
    // Fallback to first available provider
    const provider = this.getFirstAvailable(availableProviders);
    return { 
      provider, 
      reason: "Default selection based on availability" 
    };
  }

  // Assess the quality of a response to guide future model selection
  private assessResponseQuality(response: string): 'low' | 'medium' | 'high' {
    const length = response.length;
    const hasStructure = response.includes('\n\n') || response.includes('#') || response.includes('*');
    const hasTechnicalContent = response.includes('```') || response.includes('function') || response.includes('class');
    
    if ((length > 500 && hasStructure) || hasTechnicalContent) {
      return 'high';
    } else if (length > 200) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Detect the domain based on message content with improved scoring
  private detectDomain(message: string): string | null {
    // Convert message to lowercase
    const lowerMessage = message.toLowerCase();
    
    // Calculate weighted scores for each domain
    const scores: Record<string, number> = {};
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      scores[domain] = 0;
      
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerMessage.match(regex) || [];
        
        // Give more weight to specific technical terms
        if (['code', 'programming', 'algorithm', 'math', 'equation', 'scientific', 'analysis'].includes(keyword)) {
          scores[domain] += matches.length * 1.5;
        } else {
          scores[domain] += matches.length;
        }
      }
    }
    
    // Special case: check for code blocks or code-like syntax
    if (message.includes('```') || 
        (message.includes('{') && message.includes('}')) || 
        message.includes('function') || 
        message.includes('class ')) {
      scores['coding'] += 5;
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
    return maxScore > 1 ? bestDomain : null;
  }
  
  // Get the first available provider from the list
  private getFirstAvailable(availableProviders: ModelProvider[]): ModelProvider {
    // Prioritize providers that generally perform well across tasks
    const priorityOrder: ModelProvider[] = ['openai', 'claude', 'groq', 'deepseek', 'gemini'];
    
    for (const provider of priorityOrder) {
      if (availableProviders.includes(provider)) {
        return provider;
      }
    }
    
    return availableProviders[0];
  }
}

export const modelSelector = new ModelSelector();
