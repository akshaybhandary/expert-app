import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box,
  Avatar,
  Card,
  CardContent,
  Paper,
  Typography,
  Slide
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  index: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  return (
    <Slide direction="up" in timeout={300 + index * 100}>
      <Box>
        {message.sender === 'expert' ? (
          // AI Message
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              <BotIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                AI Assistant • {message.timestamp.toLocaleTimeString()}
              </Typography>
              <Card elevation={1} sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  <Box sx={{ 
                    '& p': { mb: 1 },
                    '& h1, & h2, & h3, & h4, & h5, & h6': { 
                      mt: 2, 
                      mb: 1,
                      fontWeight: 600
                    },
                    '& h1': { fontSize: '1.5rem' },
                    '& h2': { fontSize: '1.25rem' },
                    '& h3': { fontSize: '1.1rem' },
                    '& ul, & ol': { 
                      pl: 2,
                      '& li': { mb: 0.5 }
                    },
                    '& blockquote': {
                      borderLeft: 4,
                      borderColor: 'primary.main',
                      pl: 2,
                      ml: 0,
                      fontStyle: 'italic',
                      bgcolor: 'grey.50',
                      py: 1
                    },
                    '& code': { 
                      bgcolor: 'grey.100', 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    },
                    '& pre': { 
                      bgcolor: 'grey.900', 
                      color: 'white', 
                      p: 2, 
                      borderRadius: 2,
                      overflow: 'auto',
                      '& code': {
                        bgcolor: 'transparent',
                        color: 'inherit',
                        p: 0
                      }
                    },
                    '& table': {
                      borderCollapse: 'collapse',
                      width: '100%',
                      mt: 1,
                      mb: 1
                    },
                    '& th, & td': {
                      border: 1,
                      borderColor: 'grey.300',
                      px: 1,
                      py: 0.5,
                      textAlign: 'left'
                    },
                    '& th': {
                      bgcolor: 'grey.100',
                      fontWeight: 600
                    },
                    '& hr': {
                      border: 'none',
                      borderTop: 1,
                      borderColor: 'grey.300',
                      my: 2
                    },
                    '& a': {
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }
                  }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        ) : (
          // User Message
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Box sx={{ maxWidth: '70%', mr: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textAlign: 'right' }}>
                You • {message.timestamp.toLocaleTimeString()}
              </Typography>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText',
                  borderRadius: 3
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>
              </Paper>
            </Box>
            <Avatar sx={{ bgcolor: 'grey.400' }}>
              <PersonIcon />
            </Avatar>
          </Box>
        )}
      </Box>
    </Slide>
  );
};

export default MessageBubble;