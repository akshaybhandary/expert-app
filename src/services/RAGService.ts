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
  private initialized = false;

  // Search parameters are defined inline in getRelevantContext for clarity

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.vectorStorage = new VectorStorage(this.embeddingService);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.embeddingService.initialize();
    this.initialized = true;
  }

  async addMessage(text: string, sender: 'user' | 'expert', messageId: string): Promise<void> {
    await this.vectorStorage.addDocument(text, sender, messageId);
  }

  async getRelevantContext(query: string): Promise<RAGContext> {
    try {
      // Prefer fewer but stronger matches
      const searchK = 6;
      const searchMinScore = 0.35;
      const relevantMessages = await this.vectorStorage.searchSimilar(query, searchK, searchMinScore);
      
      // Calculate total tokens with overhead buffer
      let totalTokens = 0;
      const selectedMessages: SearchResult[] = [];
      const budget = Math.max(0, Math.floor(this.maxContextTokens * 0.9) - 300); // reserve ~10% and 300 tokens overhead
      
      for (const result of relevantMessages) {
        const messageTokens = Math.ceil(result.document.text.length * this.avgTokensPerChar);
        if (totalTokens + messageTokens <= Math.max(0, budget)) {
          selectedMessages.push(result);
          totalTokens += messageTokens;
        } else {
          break;
        }
      }

      // If nothing selected but results exist, fall back to summary
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

  // One-shot hydration for loading a conversation
  async rehydrateFromMessages(messages: Array<{ id: string; text: string; sender: 'user' | 'expert' }>): Promise<void> {
    await this.initialize();
    await this.vectorStorage.clear();
    for (const m of messages) {
      await this.vectorStorage.addDocument(m.text, m.sender, m.id);
    }
  }

  getMemorySize(): number {
    return this.vectorStorage.getDocumentCount();
  }
}