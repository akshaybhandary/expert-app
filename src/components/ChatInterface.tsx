import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import CssBaseline from '@mui/material/CssBaseline';

// Import our new components and services
import type { Message, AIModel, AIRequestConfig } from '../types';
import { AIService } from '../services/AIService';
import { DeepResearcher } from '../services/DeepResearcher';
import { ConversationStorage, type ConversationMessage } from '../services/ConversationStorage';
import { RAGService } from '../services/RAGService';
import { SettingsService } from '../services/SettingsService';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
// RAGIndicator is not used in this component

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [typingMessage, setTypingMessage] = useState('AI is thinking...');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // AI models configuration
  const models: AIModel[] = [
    { 
      name: 'Gemini 2.5', 
      id: 'google/gemini-2.5-pro', 
      description: 'Google\'s latest multimodal AI',
      icon: <BotIcon />,
      color: 'primary'
    },
    { 
      name: 'Grok 4', 
      id: 'x-ai/grok-4', 
      description: 'Anthropic\'s flagship model',
      icon: <BotIcon />,
      color: 'primary'
    },
    { 
      name: 'GPT-4 Turbo', 
      id: 'openai/gpt-4-turbo', 
      description: 'OpenAI\'s most capable model',
      icon: <BotIcon />,
      color: 'primary'
    },
    { 
      name: 'Llama 3.1 70B', 
      id: 'meta-llama/llama-3.1-70b-instruct', 
      description: 'Meta\'s open-source powerhouse',
      icon: <BotIcon />,
      color: 'primary'
    },
    { 
      name: 'Mistral Large', 
      id: 'mistralai/mistral-large', 
      description: 'European AI excellence',
      icon: <BotIcon />,
      color: 'primary'
    },
    { 
      name: 'Deep Researcher', 
      id: 'deep-researcher', 
      description: 'Multi-model research analysis',
      icon: <PsychologyIcon />,
      color: 'secondary'
    }
  ];

  const [selectedModelId, setSelectedModelId] = useState(models[0].id);

  // Initialize services
  const [apiKey, setApiKey] = useState('');
  const [aiService, setAiService] = useState<AIService | null>(null);
  const [deepResearcher, setDeepResearcher] = useState<DeepResearcher | null>(null);
  const ragService = useRef(new RAGService()).current;
  const conversationStorage = useRef(new ConversationStorage()).current;

  // Initialize services when API key is available
  useEffect(() => {
    if (apiKey && apiKey.trim()) {
      const service = new AIService({
        apiKey: apiKey,
        defaultMaxTokens: 2048,
        defaultTemperature: 0.7
      });
      setAiService(service);
      setDeepResearcher(new DeepResearcher(service));
    } else {
      setAiService(null);
      setDeepResearcher(null);
    }
  }, [apiKey]);

  const getSelectedModel = () => models.find(m => m.id === selectedModelId) || models[0];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history and API key
  useEffect(() => {
    const initializeApp = async () => {
      // Load API key from settings
      const savedKey = await SettingsService.getApiKey();
      setApiKey(savedKey || '');

      // Only load conversations if we have an API key
      if (savedKey && savedKey.trim()) {
        const conversations = conversationStorage.getAllConversations();
        const conversationIds = Object.keys(conversations);
          
        if (conversationIds.length > 0 && !currentConversationId) {
          // Load the most recent conversation
          const latestId = conversationIds[0];
          const latestMessages = conversations[latestId];
          setCurrentConversationId(latestId);
           
          const convertedMessages: Message[] = latestMessages.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(convertedMessages);
           
          // Initialize RAG service
          await ragService.initialize();
           
          // Add conversation history to RAG memory
          for (const msg of latestMessages) {
            await ragService.addMessage(msg.text, msg.sender, msg.id);
          }
        }
      }
    };
    initializeApp();
  }, [currentConversationId]);

  // Listen for API key changes
  useEffect(() => {
    const handleApiKeyChange = async () => {
      const key = await SettingsService.getApiKey();
      setApiKey(key || '');
    };

    // Listen for storage events (when settings are saved)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'openrouter_api_key') {
        handleApiKeyChange();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save conversation state
  useEffect(() => {
    const saveConversation = async () => {
      if (messages.length > 0 && currentConversationId) {
        const storedMessages: ConversationMessage[] = messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender as 'user' | 'expert',
          timestamp: new Date(msg.timestamp).getTime()
        }));
         
        // Save each message individually
        for (const msg of storedMessages) {
          conversationStorage.saveMessage(currentConversationId, msg);
        }
        
        // Update RAG service with new message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) {
          await ragService.addMessage(lastMessage.text, lastMessage.sender as 'user' | 'expert', lastMessage.id);
        }
      }
    };
    
    saveConversation();
  }, [messages, currentConversationId, selectedModelId]);

  // Create new conversation
  // const createNewConversation = () => {
  //   const newId = Date.now().toString();
  //   setCurrentConversationId(newId);
  //   setMessages([]);
  // };

  const handleSend = async (message: string, config: AIRequestConfig) => {
    if (!apiKey || !aiService) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: '⚠️ **API Key Required**\n\nTo use this application, you need to configure your OpenRouter API key:\n\n1. Click the settings icon in the header\n2. Enter your OpenRouter API key\n3. Save and try again\n\nGet your API key at: [OpenRouter](https://openrouter.ai/keys)',
        sender: 'expert',
        timestamp: new Date()
      }]);
      return;
    }

    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      if (selectedModelId === 'deep-researcher') {
        if (!deepResearcher) {
          throw new Error('Deep Researcher service not initialized');
        }
        
        // Deep Research mode
        setTypingMessage('Initiating deep research...');
        
        const researchId = Date.now().toString();
        const researchMessage: Message = {
          id: researchId,
          text: '🔬 **Deep Research Initiated**\n\nAssembling AI research consortium...',
          sender: 'expert',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, researchMessage]);

        const result = await deepResearcher.conductResearch(
          message,
          {
            maxTokens: config.maxTokens,
            temperature: config.temperature,
            systemPrompt: config.systemPrompt,
            includeProgress: true
          },
          (progress) => {
            const processingModels = progress.filter(p => p.status === 'processing');
            if (processingModels.length > 0) {
              setTypingMessage(`Consulting ${processingModels[0].model}...`);
            }
          }
        );

        // Update the research message with final result
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.id === researchId) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                text: result
              }
            ];
          }
          return prev;
        });

        // Research progress cleared
      } else {
        // Regular model API call with RAG
        setTypingMessage(`${getSelectedModel().name} is thinking...`);
        
        // Get enhanced prompt with RAG context
        const ragContext = await ragService.getRelevantContext(message);
        
        // Build enhanced prompt with context
        let enhancedPrompt = message;
        if (ragContext.relevantMessages.length > 0 || ragContext.summary) {
          const contextParts = [];
          
          if (ragContext.summary) {
            contextParts.push(ragContext.summary);
          }
          
          if (ragContext.relevantMessages.length > 0) {
            const relevantTexts = ragContext.relevantMessages
              .map(r => `[Previous context] ${r.document.text}`)
              .join('\n');
            contextParts.push(relevantTexts);
          }
          
          const context = contextParts.join('\n\n');
          enhancedPrompt = `Previous conversation context:\n${context}\n\nCurrent question: ${message}`;
        }
        
        const response = await aiService.sendMessage(enhancedPrompt, config);
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          text: response,
          sender: 'expert',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `❌ **Error:** ${errorMessage}\n\nPlease check your API key and try again.`,
        sender: 'expert',
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
      setTypingMessage('AI is thinking...');
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const selectedModel = getSelectedModel();

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <ChatHeader
          models={models}
          selectedModelId={selectedModelId}
          onModelSelect={handleModelSelect}
          isProcessing={isProcessing}
        />

        {/* Chat Messages */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Container maxWidth="md" sx={{ flexGrow: 1, py: 2, overflow: 'auto' }}>
            {messages.length === 0 ? (
              <WelcomeScreen />
            ) : (
              <Stack spacing={3} sx={{ pb: 2 }}>
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    index={index}
                  />
                ))}
                
                {/* Typing Indicator */}
                <TypingIndicator
                  show={isProcessing}
                  message={typingMessage}
                />
                
                <div ref={messagesEndRef} />
              </Stack>
            )}
          </Container>
        </Box>

        {/* Input Area */}
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          selectedModel={selectedModel}
          isProcessing={isProcessing}
          isMobile={isMobile}
        />
      </Box>
    </>
  );
};

export default ChatInterface;