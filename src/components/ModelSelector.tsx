import React from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import type { AIModel } from '../types';

interface ModelSelectorProps {
  models: AIModel[];
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onModelSelect,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const selectedModel = models.find(m => m.id === selectedModelId) || models[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
        variant="outlined"
        disabled={disabled}
        sx={{ 
          borderRadius: 3,
          minWidth: { xs: 'auto', sm: 200 }
        }}
      >
        {selectedModel.icon}
        <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
          {selectedModel.name}
        </Box>
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            borderRadius: 2, 
            minWidth: 320,
            maxHeight: 400
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {models.map((model) => (
          <MenuItem
            key={model.id}
            onClick={() => handleModelSelect(model.id)}
            selected={selectedModelId === model.id}
            sx={{ 
              py: 2,
              px: 3,
              '&.Mui-selected': {
                bgcolor: 'primary.50',
                '&:hover': {
                  bgcolor: 'primary.100'
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ mr: 2, color: model.color === 'secondary' ? 'secondary.main' : 'primary.main' }}>
                {model.icon}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight={500}>
                  {model.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {model.description}
                </Typography>
              </Box>
              {selectedModelId === model.id && (
                <Box sx={{ ml: 2, color: 'primary.main' }}>
                  ✓
                </Box>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ModelSelector;