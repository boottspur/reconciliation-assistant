import React, { useState } from 'react';
import { Box, Typography, Tooltip, IconButton, Paper } from '@mui/material';
import { Check, Close, AddTask, TrendingUp } from '@mui/icons-material';
import { Suggestion } from '../types';

interface SuggestionChipsProps {
  suggestions: Suggestion[];
  onAccept: (suggestion: Suggestion) => void;
  onDiscard: (suggestion: Suggestion) => void;
  onAddToTasks: (suggestion: Suggestion) => void;
  currentValue?: any;
}

const fieldDisplayNames: { [key: string]: string } = {
  'guestCount': 'Guest Count',
  'timeline.start': 'Start Time',
  'menuPackage': 'Menu Package',
  'linenColor': 'Linen Color'
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return '#4caf50';
  if (confidence >= 0.8) return '#ff9800';
  return '#f44336';
};

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ 
  suggestions, 
  onAccept, 
  onDiscard,
  onAddToTasks,
  currentValue 
}) => {
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);

  return (
    <Box>
      <Typography variant="caption" color="primary" sx={{ mb: 1, display: 'block' }}>
        Suggested Updates:
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={1}>
        {suggestions.map((suggestion) => (
          <Paper
            key={suggestion.id}
            elevation={hoveredSuggestion === suggestion.id ? 3 : 1}
            onMouseEnter={() => setHoveredSuggestion(suggestion.id)}
            onMouseLeave={() => setHoveredSuggestion(null)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: getConfidenceColor(suggestion.confidence),
              backgroundColor: hoveredSuggestion === suggestion.id ? 'rgba(25, 118, 210, 0.04)' : 'transparent'
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title={`Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`}>
                <TrendingUp 
                  sx={{ 
                    fontSize: 16, 
                    color: getConfidenceColor(suggestion.confidence)
                  }} 
                />
              </Tooltip>
              
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {fieldDisplayNames[suggestion.field] || suggestion.field}:
              </Typography>
              
              {currentValue && (
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  {currentValue}
                </Typography>
              )}
              
              <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                {suggestion.value}
              </Typography>
              
              {suggestion.originalText && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', ml: 1 }}>
                  "{suggestion.originalText}"
                </Typography>
              )}
            </Box>
            
            <Box display="flex" gap={0.5} ml={2}>
              <Tooltip title="Accept">
                <IconButton 
                  size="small" 
                  color="success"
                  onClick={() => onAccept(suggestion)}
                  sx={{ p: 0.5 }}
                >
                  <Check fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Discard">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => onDiscard(suggestion)}
                  sx={{ p: 0.5 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Add to Tasks">
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => onAddToTasks(suggestion)}
                  sx={{ p: 0.5 }}
                >
                  <AddTask fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};