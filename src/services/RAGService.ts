import { VectorStorage } from './VectorStorage';
import type { SearchResult } from './VectorStorage';
import { EmbeddingService } from './EmbeddingService';

export interface RAGContext {
  relevantMessages: SearchResult[];
  summary?: string;
  totalTokens: number;
}

export class RAGService {
  private embeddingService: EmbeddingService;
  private vectorStorage: VectorStorage;
  private maxContextTokens = 3000; // Conservative limit for mobile
  private avgTokensPerChar = 0.25; // Rough estimate

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.vectorStorage = new VectorStorage(this.embeddingService);
  }

  async initialize(): Promise<void> {
    await this.embeddingService.initialize();
  }

  async addMessage(text: string, sender: 'user' | 'expert', messageId: string): Promise<void> {
    await this.vectorStorage.addDocument(text, sender, messageId);
  }

  async getRelevantContext(query: string): Promise<RAGContext> {
    try {
      const relevantMessages = await this.vectorStorage.searchSimilar(query, 10, 0.3);
      
      // Calculate total tokens
      let totalTokens = 0;
      const selectedMessages: SearchResult[] = [];
      
      for (const result of relevantMessages) {
        const messageTokens = Math.ceil(result.document.text.length * this.avgTokensPerChar);
        
        if (totalTokens + messageTokens <= this.maxContextTokens) {
          selectedMessages.push(result);
          totalTokens += messageTokens;
        } else {
          break;
        }
      }

      // If we have too much context, create a summary
      let summary: string | undefined;
      if (selectedMessages.length === 0 && relevantMessages.length > 0) {
        summary = this.createSummary(relevantMessages);
        totalTokens = Math.ceil(summary.length * this.avgTokensPerChar);
      }

      return {
        relevantMessages: selectedMessages,
        summary,
        totalTokens,
      };
    } catch (error) {
      console.error('Error getting RAG context:', error);
      return {
        relevantMessages: [],
        totalTokens: 0,
      };
    }
  }

  private createSummary(messages: SearchResult[]): string {
    const texts = messages.map(r => r.document.text).slice(0, 3);
    return `Previous context: ${texts.join(' ').substring(0, 500)}...`;
  }

  async clearMemory(): Promise<void> {
    this.vectorStorage.clear();
  }

  getMemorySize(): number {
    return this.vectorStorage.getDocumentCount();
  }
}