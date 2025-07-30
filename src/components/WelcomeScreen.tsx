import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Stack,
  Chip,
  Fade
} from '@mui/material';
import {
  SmartToy as BotIcon
} from '@mui/icons-material';

const WelcomeScreen: React.FC = () => {
  return (
    <Fade in timeout={1000}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        textAlign: 'center',
        py: 8,
        px: 2
      }}>
        <Avatar sx={{ 
          width: { xs: 60, sm: 80 }, 
          height: { xs: 60, sm: 80 }, 
          mb: 3, 
          bgcolor: 'primary.main' 
        }}>
          <BotIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />
        </Avatar>
        
        <Typography 
          variant="h4" 
          gutterBottom 
          color="text.primary"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontWeight: 600
          }}
        >
          Hello! I'm your Expert Assistant
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 4, 
            maxWidth: 500,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          I'm here to help you with any questions or tasks you might have. 
          Choose an AI model and start chatting!
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={1} 
          flexWrap="wrap" 
          justifyContent="center"
          sx={{ gap: 1 }}
        >
          <Chip
            label="Multi-Model Research"
            color="secondary"
            variant="outlined"
            size="small"
          />
          <Chip
            label="Web Search Integration"
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label="Real-time Responses"
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label="Configurable Parameters"
            color="primary"
            variant="outlined"
            size="small"
          />
        </Stack>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            💡 Try asking about complex topics to see the Deep Researcher in action
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default WelcomeScreen;