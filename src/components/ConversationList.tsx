import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
  Button
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Add as AddIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
}

interface ConversationListProps {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  currentConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  open,
  onClose,
  conversations,
  onSelectConversation,
  onNewConversation,
  currentConversationId
}) => {
  const sortedConversations = [...conversations].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: 600,
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Conversations</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            fullWidth
          >
            New Chat
          </Button>
        </Box>
        
        <List sx={{ p: 0 }}>
          {sortedConversations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No conversations yet. Start a new chat to get started!
              </Typography>
            </Box>
          ) : (
            sortedConversations.map((conv) => (
              <React.Fragment key={conv.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={conv.id === currentConversationId}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onClose();
                    }}
                    sx={{ py: 2, px: 2 }}
                  >
                    <ListItemIcon>
                      <ChatIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" noWrap>
                            {conv.title || 'Untitled Chat'}
                          </Typography>
                          {conv.id === currentConversationId && (
                            <Chip label="Active" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {conv.lastMessage || 'No messages yet'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <TimeIcon fontSize="small" />
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(conv.timestamp), { addSuffix: true })}
                            </Typography>
                            <Chip 
                              label={`${conv.messageCount} messages`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationList;