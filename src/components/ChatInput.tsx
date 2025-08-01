import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Fab,
  Typography,
  Stack,
  Collapse,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  VpnKey as KeyIcon,
  Lock as LockIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import type { AIModel, AIRequestConfig } from '../types';
import { SettingsService } from '../services/SettingsService';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (message: string, config: AIRequestConfig) => void;
  selectedModel: AIModel;
  isProcessing: boolean;
  isMobile: boolean;
  onOpenSettings?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSend,
  selectedModel,
  isProcessing,
  isMobile,
  onOpenSettings
}) => {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [temperature, setTemperature] = useState(0.7);

  useEffect(() => {
    const load = async () => {
      const key = await SettingsService.getApiKey();
      setHasApiKey(!!key);
      setApiKey(key || '');
      const s = SettingsService.getSettings();
      if (typeof s.maxTokens === 'number') setMaxTokens(s.maxTokens);
      if (typeof s.temperature === 'number') setTemperature(s.temperature);
    };
    load();

    // react to settings changes in same tab
    const handler = () => {
      const s = SettingsService.getSettings();
      if (typeof s.maxTokens === 'number') setMaxTokens(s.maxTokens);
      if (typeof s.temperature === 'number') setTemperature(s.temperature);
    };
    window.addEventListener('settings-updated', handler as EventListener);

    // react to storage updates from other tabs
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'expert-app-settings') {
        handler();
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener('settings-updated', handler as EventListener);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      const config: AIRequestConfig = {
        model: selectedModel.id,
        maxTokens,
        temperature,
        systemPrompt: undefined
      };
      onSend(input, config);
    }
  };

  const handleSaveApiKey = async () => {
    if (apiKey.trim()) {
      await SettingsService.setApiKey(apiKey.trim());
      setHasApiKey(true);
      setShowApiKeyInput(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ bgcolor: 'background.paper' }}>
      {/* API Key Input - shown only when no key is configured */}
      <Collapse in={showApiKeyInput && !hasApiKey}>
        <Container maxWidth="md" sx={{ py: 2, px: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <KeyIcon sx={{ mr: 1 }} />
            Configure API Key
          </Typography>
          
          <TextField
            fullWidth
            label="OpenRouter API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenRouter API key..."
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />
          
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowApiKeyInput(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim()}
            >
              Save Key
            </Button>
          </Stack>
        </Container>
      </Collapse>

      {/* Input Area */} 
      <Container maxWidth="md" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Expert Assistant..."
            variant="outlined"
            disabled={isProcessing}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
              }
            }}
          />
           
          <IconButton
            onClick={onOpenSettings}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
            title="Settings"
          >
            <SettingsIcon />
          </IconButton>
           
          <Fab
            color="primary"
            size={isMobile ? "medium" : "large"}
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
          >
            <SendIcon />
          </Fab>
        </Box>

        {/* API Key Button - shown at bottom when no key is configured */}
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
          {!hasApiKey && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<KeyIcon />}
              onClick={onOpenSettings}
            >
              Configure API Key
            </Button>
          )}
          {hasApiKey && (
            <Button
              variant="text"
              size="small"
              startIcon={<LockIcon />}
              onClick={onOpenSettings}
              color="success"
            >
              API Key Configured
            </Button>
          )}
        </Box>
      </Container>
    </Paper>
  );
};

export default ChatInput;