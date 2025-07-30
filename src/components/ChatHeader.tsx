import React from 'react';
import {
  AppBar,
  Toolbar,
  Avatar,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  SmartToy as BotIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import ModelSelector from './ModelSelector';
import { useThemeMode } from '../contexts/ThemeContext';
import type { AIModel } from '../types';

interface ChatHeaderProps {
  models: AIModel[];
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  isProcessing?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  models,
  selectedModelId,
  onModelSelect,
  isProcessing = false
}) => {
  const { isDarkMode, toggleTheme } = useThemeMode();

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider' 
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
          <BotIcon />
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              color: 'text.primary',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Expert Assistant
          </Typography>
          {isProcessing && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1 }}
            >
              Processing...
            </Typography>
          )}
        </Box>
        
        <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton
            onClick={toggleTheme}
            sx={{ mr: 1, color: 'text.primary' }}
            size="medium"
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        
        <ModelSelector
          models={models}
          selectedModelId={selectedModelId}
          onModelSelect={onModelSelect}
          disabled={isProcessing}
        />
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;