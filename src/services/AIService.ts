import type { AIRequestConfig, ChatConfig } from '../types';
import { SettingsService } from './SettingsService';

export class AIService {
  private config: ChatConfig;

  constructor(config: ChatConfig) {
    this.config = config;
  }

  async sendMessage(
    message: string,
    requestConfig: AIRequestConfig
  ): Promise<string> {
    const {
      model,
      maxTokens = this.config.defaultMaxTokens || 2048,
      temperature = this.config.defaultTemperature || 0.7,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      systemPrompt,
      enableWebSearch = false
    } = requestConfig;

    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: message });

    // Enable web search by appending ":ng1q2aw`se1d`swzx zsaFZqa zxx" to model name if needed
    const finalModel = enableWebSearch && !model.includes(':online')
      ? `${model}:online`
      : model;

    const requestBody: any = {
      model: finalModel,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream: false
    };

    const apiKey = SettingsService.getApiKey();
    if (!apiKey) {
      throw new Error('API key not configured. Please set your API key in settings.');
    }

    const response = await fetch(this.config.baseUrl || 'https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Expert Assistant'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from API');
    }

    return data.choices[0].message.content;
  }

  async streamMessage(
    message: string,
    requestConfig: AIRequestConfig,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const {
      model,
      maxTokens = this.config.defaultMaxTokens || 2048,
      temperature = this.config.defaultTemperature || 0.7,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      systemPrompt,
      enableWebSearch = false
    } = requestConfig;

    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: message });

    // Enable web search by appending ":online" to model name if needed
    const finalModel = enableWebSearch && !model.includes(':online')
      ? `${model}:online`
      : model;

    const requestBody: any = {
      model: finalModel,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream: true
    };

    const apiKey = SettingsService.getApiKey();
    if (!apiKey) {
      throw new Error('API key not configured. Please set your API key in settings.');
    }

    const response = await fetch(this.config.baseUrl || 'https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Expert Assistant'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  updateConfig(newConfig: Partial<ChatConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}