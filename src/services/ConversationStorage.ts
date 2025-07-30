/**
 * Conversation Storage Service
 * Provides basic conversation history persistence using localStorage
 * Zero-cost solution for mobile-first AI chat
 */

export interface StoredConversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
  model: string;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
}

class ConversationStorage {
  private readonly STORAGE_KEY = 'ai-chat-conversations';
  private readonly MAX_CONVERSATIONS = 50;
  private readonly MAX_MESSAGES_PER_CONVERSATION = 1000;

  /**
   * Save a conversation to localStorage
   */
  saveConversation(conversation: StoredConversation): void {
    try {
      const conversations = this.getAllConversations();
      
      // Update existing or add new
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.unshift(conversation);
        
        // Limit number of conversations
        if (conversations.length > this.MAX_CONVERSATIONS) {
          conversations.splice(this.MAX_CONVERSATIONS);
        }
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  /**
   * Get all conversations
   */
  getAllConversations(): StoredConversation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  }

  /**
   * Get a specific conversation by ID
   */
  getConversation(id: string): StoredConversation | null {
    const conversations = this.getAllConversations();
    return conversations.find(c => c.id === id) || null;
  }

  /**
   * Delete a conversation
   */
  deleteConversation(id: string): void {
    try {
      const conversations = this.getAllConversations();
      const filtered = conversations.filter(c => c.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }

  /**
   * Clear all conversations
   */
  clearAllConversations(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear conversations:', error);
    }
  }

  /**
   * Create a new conversation
   */
  createConversation(title: string, model: string): StoredConversation {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model
    };
  }

  /**
   * Add a message to a conversation
   */
  addMessageToConversation(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    model?: string
  ): boolean {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return false;

    const message: StoredMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      model
    };

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    // Limit messages per conversation
    if (conversation.messages.length > this.MAX_MESSAGES_PER_CONVERSATION) {
      conversation.messages = conversation.messages.slice(-this.MAX_MESSAGES_PER_CONVERSATION);
    }

    this.saveConversation(conversation);
    return true;
  }

  /**
   * Get recent conversations (last 10)
   */
  getRecentConversations(limit: number = 10): StoredConversation[] {
    const conversations = this.getAllConversations();
    return conversations.slice(0, limit);
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; available: number; conversations: number } {
    try {
      const conversations = this.getAllConversations();
      const used = new Blob([localStorage.getItem(this.STORAGE_KEY) || '']).size;
      const available = 5 * 1024 * 1024; // Approximate 5MB limit
      
      return {
        used,
        available,
        conversations: conversations.length
      };
    } catch (error) {
      return { used: 0, available: 5 * 1024 * 1024, conversations: 0 };
    }
  }
}

// Export singleton instance
export const conversationStorage = new ConversationStorage();