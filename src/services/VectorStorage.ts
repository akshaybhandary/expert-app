import { EmbeddingService } from './EmbeddingService';

export interface VectorDocument {
  id: string;
  text: string;
  vector: number[];
  metadata: {
    timestamp: number;
    role: 'user' | 'assistant';
    messageId: string;
  };
}

export interface SearchResult {
  document: VectorDocument;
  score: number;
}

export class VectorStorage {
  private documents: VectorDocument[] = [];
  private embeddingService: EmbeddingService;
  private maxDocuments = 1000; // Limit to prevent memory issues

  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
  }

  async addDocument(
    text: string,
    sender: 'user' | 'expert',
    messageId: string
  ): Promise<void> {
    try {
      const vector = await this.embeddingService.generateEmbedding(text);
      const document: VectorDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        vector,
        metadata: {
          timestamp: Date.now(),
          role: sender === 'expert' ? 'assistant' : 'user',
          messageId,
        },
      };

      // Add new document
      this.documents.push(document);

      // Remove oldest documents if we exceed the limit
      if (this.documents.length > this.maxDocuments) {
        this.documents.sort((a, b) => a.metadata.timestamp - b.metadata.timestamp);
        this.documents = this.documents.slice(-this.maxDocuments);
      }
    } catch (error) {
      console.error('Error adding document to vector storage:', error);
    }
  }

  async searchSimilar(
    query: string,
    topK: number = 5,
    minScore: number = 0.3
  ): Promise<SearchResult[]> {
    try {
      if (this.documents.length === 0) {
        return [];
      }

      const queryVector = await this.embeddingService.generateEmbedding(query);
      
      // Calculate cosine similarity for each document
      const similarities = this.documents.map(doc => ({
        document: doc,
        score: this.cosineSimilarity(queryVector, doc.vector),
      }));

      // Filter by minimum score and sort by similarity
      return similarities
        .filter(result => result.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    } catch (error) {
      console.error('Error searching vector storage:', error);
      return [];
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  clear(): void {
    this.documents = [];
  }

  getDocumentCount(): number {
    return this.documents.length;
  }
}