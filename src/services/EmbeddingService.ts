import { pipeline } from '@xenova/transformers';

export class EmbeddingService {
  private embedder: any = null;
  private modelName = 'Xenova/all-MiniLM-L6-v2';

  async initialize(): Promise<void> {
    try {
      this.embedder = await pipeline('feature-extraction', this.modelName);
    } catch (error) {
      console.error('Error initializing embedding service:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embedder) {
      await this.initialize();
    }

    try {
      const result = await this.embedder(text, { pooling: 'mean', normalize: true });
      return Array.from(result.data);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.embedder !== null;
  }
}