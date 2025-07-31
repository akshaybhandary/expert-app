export interface ConversationMessage {
  id: string;
  text: string;
  sender: 'user' | 'expert';
  timestamp: number;
}

export class ConversationStorage {
  private storageKey = 'expert-app-conversations';

  saveMessage(conversationId: string, message: ConversationMessage): void {
    try {
      const conversations = this.getAllConversations();
      if (!conversations[conversationId]) {
        conversations[conversationId] = [];
      }
      conversations[conversationId].push(message);
      localStorage.setItem(this.storageKey, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  getConversation(conversationId: string): ConversationMessage[] {
    try {
      const conversations = this.getAllConversations();
      return conversations[conversationId] || [];
    } catch (error) {
      console.error('Error getting conversation:', error);
      return [];
    }
  }

  getAllConversations(): Record<string, ConversationMessage[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting all conversations:', error);
      return {};
    }
  }

  clearConversation(conversationId: string): void {
    try {
      const conversations = this.getAllConversations();
      delete conversations[conversationId];
      localStorage.setItem(this.storageKey, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  }

  clearAllConversations(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing all conversations:', error);
    }
  }
}