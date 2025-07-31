import { RAGService } from '../RAGService';
import type { Message } from '../../types';

// Simple test to verify RAG functionality
async function testRAGService() {
  console.log('🧪 Testing RAG Service...');
  
  const ragService = new RAGService();
  
  // Test data
  const testMessages: Message[] = [
    {
      id: '1',
      text: 'What is the capital of France?',
      sender: 'user',
      timestamp: new Date()
    },
    {
      id: '2',
      text: 'The capital of France is Paris.',
      sender: 'expert',
      timestamp: new Date()
    },
    {
      id: '3',
      text: 'Tell me about French culture',
      sender: 'user',
      timestamp: new Date()
    },
    {
      id: '4',
      text: 'French culture is known for its cuisine, art, fashion, and philosophy. Paris is the cultural center with world-class museums like the Louvre.',
      sender: 'expert',
      timestamp: new Date()
    }
  ];
  
  try {
    // Test initialization
    console.log('📊 Initializing RAG service...');
    await ragService.initialize();
    console.log('✅ RAG service initialized successfully');
    
    // Add test messages to memory
    console.log('💾 Adding messages to memory...');
    for (const message of testMessages) {
      await ragService.addMessage(message.text, message.sender, message.id);
    }
    console.log('✅ Messages added to memory');
    
    // Test semantic search
    console.log('🔍 Testing semantic search...');
    const context = await ragService.getRelevantContext('What do you know about Paris?');
    console.log('✅ Search context:', context);
    
    // Test memory stats
    console.log('📈 Memory size:', ragService.getMemorySize());
    
    console.log('🎉 All RAG tests passed!');
    
  } catch (error) {
    console.error('❌ RAG test failed:', error);
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - attach to window for testing
  (window as any).testRAG = testRAGService;
} else {
  // Node environment - run test
  testRAGService();
}