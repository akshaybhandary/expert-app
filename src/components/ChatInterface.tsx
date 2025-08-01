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
import SettingsModal from './SettingsModal';
import ConversationList from './ConversationList';
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
      name: 'GPT-4o',
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationListOpen, setConversationListOpen] = useState(false);

  // Initialize services
  const [apiKey, setApiKey] = useState('');
  const [aiService, setAiService] = useState<AIService | null>(null);
  const [deepResearcher, setDeepResearcher] = useState<DeepResearcher | null>(null);
  const ragService = useRef(new RAGService()).current;
  const conversationStorage = useRef(new ConversationStorage()).current;

  // Initialize services when API key is available
  useEffect(() => {
    if (apiKey && apiKey.trim()) {
      const currentSettings = SettingsService.getSettings();
      const service = new AIService({
        apiKey: apiKey,
        defaultMaxTokens: currentSettings.maxTokens ?? 2048,
        defaultTemperature: currentSettings.temperature ?? 0.7
      });
      setAiService(service);
      setDeepResearcher(new DeepResearcher(service));
    } else {
      setAiService(null);
      setDeepResearcher(null);
    }
  }, [apiKey]);

  const getSelectedModel = () => models.find(m => m.id === selectedModelId) || models[0];

  // Cache settings in state to avoid repeated synchronous localStorage reads
  const [settingsState, setSettingsState] = useState(() => SettingsService.getSettings());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load API key, selected model; do not hydrate RAG on mount (lazy for faster startup)
  useEffect(() => {
    const initializeApp = async () => {
      const savedKey = await SettingsService.getApiKey();
      setApiKey(savedKey || '');

      const s = SettingsService.getSettings();
      setSettingsState(s);
      if (s.defaultModel) {
        setSelectedModelId(s.defaultModel);
      }

      // Only ensure there is a conversation ID; avoid heavy hydration at startup
      if (savedKey && savedKey.trim() && !currentConversationId) {
        const conversations = conversationStorage.getAllConversations();
        const conversationIds = Object.keys(conversations);
        if (conversationIds.length > 0) {
          const latestId = conversationIds[0];
          setCurrentConversationId(latestId);
          const latestMessages = conversations[latestId] || [];
          // Light render: map messages without any async RAG calls
          const converted: Message[] = latestMessages.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(converted);
        } else {
          createNewConversation();
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
      if (e.key === 'expert-app-settings') {
        handleApiKeyChange();
        const s = SettingsService.getSettings();
        setSettingsState(s);
        if (s.defaultModel) setSelectedModelId(s.defaultModel);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Also listen to custom settings-updated events for same-tab updates
  useEffect(() => {
    const handler = () => {
      const key = SettingsService.getApiKey();
      setApiKey(key || '');
      const s = SettingsService.getSettings();
      setSettingsState(s);
      if (s.defaultModel) setSelectedModelId(s.defaultModel);
    };
    window.addEventListener('settings-updated', handler);
    return () => window.removeEventListener('settings-updated', handler);
  }, []);

  // Save conversation state (only persist the latest message change)
  const lastSavedIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!currentConversationId || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (!last || lastSavedIdRef.current === last.id) return;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    saveTimerRef.current = window.setTimeout(async () => {
      const toStore: ConversationMessage = {
        id: last.id,
        text: last.text,
        sender: last.sender as 'user' | 'expert',
        timestamp: new Date(last.timestamp).getTime()
      };
      conversationStorage.saveMessage(currentConversationId!, toStore);
      lastSavedIdRef.current = last.id;

      try {
        await ragService.addMessage(last.text, last.sender as 'user' | 'expert', last.id);
      } catch (e) {
        console.warn('Failed adding latest message to RAG', e);
      }
    }, 300);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [messages, currentConversationId]);

  // Create new conversation
  const createNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    setCurrentConversationId(newId);
    setMessages([]);
    return newId;
  };

  const handleSend = async (message: string, config: AIRequestConfig) => {
    if (!apiKey || !aiService) {
      // Open settings instead of injecting message noise
      setSettingsOpen(true);
      return;
    }

    // Ensure we have a conversation ID
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = createNewConversation();
    }

    // Compute effective model considering Web Search toggle (use cached settingsState)
    const baseModel = selectedModelId;
    const effectiveModel = settingsState.enableWebSearch ? `${baseModel}:online` : baseModel;

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

    // Add user message to RAG early for immediate context
    try {
      await ragService.addMessage(newMessage.text, 'user', newMessage.id);
    } catch (e) {
      console.warn('Failed adding user message to RAG', e);
    }

    // Override request config with effective model and settings defaults
    config.model = effectiveModel;
    if (settingsState.maxTokens) config.maxTokens = settingsState.maxTokens;
    if (typeof settingsState.temperature === 'number') config.temperature = settingsState.temperature;

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
          timestamp: new Date(),
          model: 'deep-researcher'
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
                text: result,
                model: 'deep-researcher'
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
          timestamp: new Date(),
          model: selectedModelId
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Add assistant message to RAG memory to improve follow-ups
        try {
          await ragService.addMessage(assistantMessage.text, 'expert', assistantMessage.id);
        } catch (e) {
          console.warn('Failed adding assistant message to RAG', e);
        }
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

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleLoadConversation = async (conversationId: string) => {
    try {
      const conversations = conversationStorage.getAllConversations();
      const conversationMessages = conversations[conversationId] || [];
      setCurrentConversationId(conversationId);

      // Defensive mapping
      const convertedMessages: Message[] = (conversationMessages || []).map(msg => ({
        id: msg.id ?? String(Date.now()),
        text: msg.text ?? '',
        sender: (msg.sender as 'user' | 'expert') ?? 'user',
        timestamp: new Date(msg.timestamp ?? Date.now())
      }));

      setMessages(convertedMessages);

      // Hydrate RAG memory with the whole conversation atomically
      await ragService.rehydrateFromMessages(
        (conversationMessages || []).map(m => ({
          id: m.id,
          text: m.text,
          sender: m.sender
        }))
      );
    } catch (e) {
      console.error('Failed to load conversation', e);
    }
  };

  const handleNewConversation = () => {
    createNewConversation();
    setMessages([]);
    // Do not block UI; RAG will hydrate on demand when sending or loading
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
          onNewConversation={handleNewConversation}
          onSettingsClick={handleOpenSettings}
          onOpenConversationList={() => setConversationListOpen(true)}
        />

        {/* Chat Messages */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Container maxWidth="md" sx={{ flexGrow: 1, py: 2, overflow: 'auto' }}>
            {messages.length === 0 ? (
              <WelcomeScreen />
            ) : (
              <Stack spacing={3} sx={{ pb: 2 }}>
                {(messages.length > 120 ? messages.slice(-120) : messages).map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    index={index}
                    isDeepResearch={message.model === 'deep-researcher'}
                  />
                ))}
                <TypingIndicator show={isProcessing} message={typingMessage} />
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
          onOpenSettings={handleOpenSettings}
        />
      </Box>
      
      <SettingsModal
        open={settingsOpen}
        onClose={handleCloseSettings}
      />
      
      <ConversationList
        open={conversationListOpen}
        onClose={() => setConversationListOpen(false)}
        conversations={Object.entries(conversationStorage.getAllConversations()).map(([id, msgs]) => ({
          id,
          title: (msgs.find(m => m.sender === 'user')?.text || msgs[0]?.text || 'Untitled Chat').substring(0, 50),
          lastMessage: msgs[msgs.length - 1]?.text || 'No messages yet',
          timestamp: msgs[msgs.length - 1]?.timestamp || Date.now(),
          messageCount: msgs.length
        }))}
        onSelectConversation={(id) => {
          setConversationListOpen(false);
          return handleLoadConversation(id);
        }}
        onNewConversation={() => {
          setConversationListOpen(false);
          handleNewConversation();
        }}
        currentConversationId={currentConversationId || undefined}
      />
    </>
  );
};

export default ChatInterface;