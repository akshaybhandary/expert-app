import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Switch,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormGroup,
  Chip
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { SettingsService } from '../services/SettingsService';
import type { Settings } from '../types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(SettingsService.getSettings());
  const [tempSettings, setTempSettings] = useState<Settings>(settings);
  const [apiKeyError, setApiKeyError] = useState('');

  useEffect(() => {
    if (open) {
      setTempSettings(SettingsService.getSettings());
    }
  }, [open]);

  const handleSave = () => {
    // Validate API key
    if (!tempSettings.apiKey.trim()) {
      setApiKeyError('API key is required');
      return;
    }

    SettingsService.saveSettings(tempSettings);
    setSettings(tempSettings);
    onClose();
    
    // Show success message
    window.dispatchEvent(new CustomEvent('settings-updated'));
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setApiKeyError('');
    onClose();
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSettings({ ...tempSettings, apiKey: e.target.value });
    setApiKeyError('');
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSettings({ ...tempSettings, theme: e.target.value as Settings['theme'] });
  };

  const handleToggle = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSettings({ ...tempSettings, [key]: e.target.checked });
  };

  const handleSliderChange = (key: keyof Settings) => (_: Event, value: number | number[]) => {
    setTempSettings({ ...tempSettings, [key]: value });
  };

  const isApiKeyValid = tempSettings.apiKey.trim().length > 0;

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: 1,
        borderColor: 'divider',
        py: 2
      }}>
        <SettingsIcon />
        Settings
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* API Key Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              API Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter your OpenRouter API key to use the AI models
            </Typography>
            
            <TextField
              fullWidth
              label="OpenRouter API Key"
              type="password"
              value={tempSettings.apiKey}
              onChange={handleApiKeyChange}
              error={!!apiKeyError}
              helperText={apiKeyError || 'Get your key at openrouter.ai/keys'}
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            />
            
            {isApiKeyValid && (
              <Chip 
                label="API Key Configured" 
                color="success" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Theme Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <FormControl>
              <FormLabel>Theme</FormLabel>
              <RadioGroup
                value={tempSettings.theme}
                onChange={handleThemeChange}
                row
              >
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                <FormControlLabel value="system" control={<Radio />} label="System" />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* AI Settings */}
          <Box>
            <Typography variant="h6" gutterBottom>
              AI Configuration
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Max Tokens: {tempSettings.maxTokens}</Typography>
              <Slider
                value={tempSettings.maxTokens}
                onChange={handleSliderChange('maxTokens')}
                min={512}
                max={4096}
                step={128}
                marks={[
                  { value: 512, label: '512' },
                  { value: 2048, label: '2048' },
                  { value: 4096, label: '4096' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Temperature: {tempSettings.temperature}</Typography>
              <Slider
                value={tempSettings.temperature}
                onChange={handleSliderChange('temperature')}
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
          </Box>

          {/* RAG Settings */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Long Context Settings
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={tempSettings.enableRAG} 
                    onChange={handleToggle('enableRAG')}
                  />
                }
                label="Enable RAG (Retrieval-Augmented Generation)"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={tempSettings.enableSummarization} 
                    onChange={handleToggle('enableSummarization')}
                  />
                }
                label="Enable Conversation Summarization"
              />
            </FormGroup>
          </Box>

          {/* Info Alert */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Your settings are saved locally in your browser. No data is sent to external servers except your API calls to OpenRouter.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!isApiKeyValid}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}