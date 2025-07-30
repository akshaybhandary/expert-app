export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'expert';
  timestamp: Date;
}

export interface ResearchProgress {
  id: string;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  content?: string;
}

export interface AIModel {
  name: string;
  id: string;
  description: string;
  icon: React.ReactElement;
  color: 'primary' | 'secondary';
}

export interface AIRequestConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  enableWebSearch?: boolean;
}

export interface DeepResearchConfig {
  models?: string[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  includeProgress?: boolean;
}

export interface ChatConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultMaxTokens?: number;
  defaultTemperature?: number;
}