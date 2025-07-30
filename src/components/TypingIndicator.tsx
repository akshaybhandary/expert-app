import React from 'react';
import {
  Box,
  Avatar,
  Card,
  CircularProgress,
  Typography,
  Fade
} from '@mui/material';
import {
  SmartToy as BotIcon
} from '@mui/icons-material';

interface TypingIndicatorProps {
  message?: string;
  show: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  message = "AI is thinking...",
  show 
}) => {
  if (!show) return null;

  return (
    <Fade in={show}>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
          <BotIcon />
        </Avatar>
        <Card 
          elevation={1} 
          sx={{ 
            p: 2, 
            bgcolor: 'background.paper',
            borderRadius: 3,
            minWidth: 120
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress 
              size={16} 
              sx={{ 
                mr: 2,
                color: 'primary.main'
              }} 
            />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontStyle: 'italic' }}
            >
              {message}
            </Typography>
          </Box>
        </Card>
      </Box>
    </Fade>
  );
};

export default TypingIndicator;