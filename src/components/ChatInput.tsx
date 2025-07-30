import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Fab,
  Typography,
  Stack,
  Chip,
  Collapse,
  Slider,
  InputAdornment,
  Tooltip,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Send as SendIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import type { AIModel, AIRequestConfig } from '../types';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (message: string, config: AIRequestConfig) => void;
  selectedModel: AIModel;
  isProcessing: boolean;
  isMobile: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSend,
  selectedModel,
  isProcessing,
  isMobile
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [enableWebSearch, setEnableWebSearch] = useState(false);

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
        topP,
        systemPrompt: systemPrompt.trim() || undefined,
        enableWebSearch: selectedModel.id === 'deep-researcher' ? true : enableWebSearch
      };
      onSend(input, config);
    }
  };

  const resetSettings = () => {
    setMaxTokens(2048);
    setTemperature(0.7);
    setTopP(1);
    setSystemPrompt('');
    setEnableWebSearch(false);
  };

  return (
    <Paper elevation={3} sx={{ bgcolor: 'background.paper' }}>
      {/* Settings Panel */}
      <Collapse in={showSettings}>
        <Container maxWidth="md" sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} />
            AI Configuration
          </Typography>
          
          <Stack spacing={3}>
            {/* System Prompt */}
            <TextField
              fullWidth
              multiline
              rows={2}
              label="System Prompt (Optional)"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Provide instructions for how the AI should behave..."
              variant="outlined"
              size="small"
            />
            
            {/* Web Search Toggle - only show for non-Deep Researcher models */}
            {selectedModel.id !== 'deep-researcher' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={enableWebSearch}
                    onChange={(e) => setEnableWebSearch(e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Web Search"
                sx={{ mt: 1 }}
              />
            )}
            
            {/* Deep Researcher Web Search Info */}
            {selectedModel.id === 'deep-researcher' && (
              <Box sx={{
                mt: 1,
                p: 2,
                bgcolor: 'secondary.50',
                borderRadius: 2,
                border: 1,
                borderColor: 'secondary.200'
              }}>
                <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 500 }}>
                  🔍 Web Search Enabled by Default
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Deep Researcher automatically uses web search for all models to provide current information.
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
              {/* Max Tokens */}
              <Box>
                <Typography gutterBottom variant="body2" fontWeight={500}>
                  Max Tokens: {maxTokens}
                </Typography>
                <Slider
                  value={maxTokens}
                  onChange={(_, value) => setMaxTokens(value as number)}
                  min={100}
                  max={4096}
                  step={100}
                  marks={[
                    { value: 512, label: '512' },
                    { value: 2048, label: '2K' },
                    { value: 4096, label: '4K' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              {/* Temperature */}
              <Box>
                <Typography gutterBottom variant="body2" fontWeight={500}>
                  Temperature: {temperature}
                </Typography>
                <Slider
                  value={temperature}
                  onChange={(_, value) => setTemperature(value as number)}
                  min={0}
                  max={2}
                  step={0.1}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 1, label: '1' },
                    { value: 2, label: '2' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              {/* Top P */}
              <Box>
                <Typography gutterBottom variant="body2" fontWeight={500}>
                  Top P: {topP}
                </Typography>
                <Slider
                  value={topP}
                  onChange={(_, value) => setTopP(value as number)}
                  min={0}
                  max={1}
                  step={0.05}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 0.5, label: '0.5' },
                    { value: 1, label: '1' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={resetSettings} size="small">
                <ClearIcon />
              </IconButton>
            </Box>
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
            InputProps={{
              endAdornment: input && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => onInputChange('')}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
              }
            }}
          />
          
          <Tooltip title="AI Settings">
            <IconButton
              onClick={() => setShowSettings(!showSettings)}
              color={showSettings ? 'primary' : 'default'}
              disabled={isProcessing}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Fab
            color="primary"
            size={isMobile ? "medium" : "large"}
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            sx={{ ml: 1 }}
          >
            <SendIcon />
          </Fab>
        </Box>
        
        {/* Status Bar */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip 
              icon={selectedModel.icon} 
              label={selectedModel.name}
              color={selectedModel.color as any}
              variant="outlined"
              size="small"
            />
            {selectedModel.id === 'deep-researcher' && (
              <Chip 
                icon={<PsychologyIcon />}
                label="Multi-Model Research"
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
            {showSettings && (
              <Chip
                label={`${maxTokens} tokens • T:${temperature} • P:${topP}${(selectedModel.id === 'deep-researcher' || enableWebSearch) ? ' • 🔍 Web' : ''}`}
                variant="outlined"
                size="small"
                color="info"
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Press Enter to send
          </Typography>
        </Box>
      </Container>
    </Paper>
  );
};

export default ChatInput;