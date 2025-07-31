import type { Settings } from '../types';

export class SettingsService {
  private static readonly STORAGE_KEY = 'expert-app-settings';
  
  static getSettings(): Settings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.getDefaultSettings();
      }
    }
    return this.getDefaultSettings();
  }

  static saveSettings(settings: Settings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  static getApiKey(): string {
    const settings = this.getSettings();
    return settings.apiKey || '';
  }

  static setApiKey(apiKey: string): void {
    const settings = this.getSettings();
    settings.apiKey = apiKey;
    this.saveSettings(settings);
  }

  static hasApiKey(): boolean {
    return this.getApiKey().trim().length > 0;
  }

  private static getDefaultSettings(): Settings {
    return {
      apiKey: '',
      theme: 'system',
      maxTokens: 2048,
      temperature: 0.7,
      enableRAG: true,
      enableSummarization: true
    };
  }
}