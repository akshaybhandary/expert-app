import { useState, useEffect } from 'react';
import { Box, Chip, Tooltip, CircularProgress } from '@mui/material';
import { Psychology as MemoryIcon } from '@mui/icons-material';

interface RAGIndicatorProps {
  isActive: boolean;
  contextLength?: number;
  onClick?: () => void;
}

export const RAGIndicator = ({ isActive, contextLength, onClick }: RAGIndicatorProps) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const getLabel = () => {
    if (isLoading) return 'Searching memory...';
    if (contextLength && contextLength > 0) return `${contextLength} context items`;
    return 'Memory ready';
  };

  return (
    <Tooltip 
      title={isActive ? 'Using conversation memory for context' : 'RAG memory system active'}
      placement="top"
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <Chip
          icon={isLoading ? <CircularProgress size={16} /> : <MemoryIcon />}
          label={getLabel()}
          color={isActive ? 'primary' : 'default'}
          size="small"
          variant={isActive ? 'filled' : 'outlined'}
          onClick={onClick}
          sx={{
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: onClick ? 'scale(1.05)' : 'none',
            },
          }}
        />
      </Box>
    </Tooltip>
  );
};