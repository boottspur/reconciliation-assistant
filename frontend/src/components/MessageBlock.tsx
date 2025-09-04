import React from 'react';
import { Box, Paper, Typography, Avatar } from '@mui/material';
import { Person, Business } from '@mui/icons-material';
import { format } from 'date-fns';
import { Message } from '../types';

interface MessageBlockProps {
  message: Message;
  children?: React.ReactNode;
}

export const MessageBlock: React.FC<MessageBlockProps> = ({ message, children }) => {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 2, 
        p: 2,
        backgroundColor: message.isGuest ? '#f5f5f5' : '#fff'
      }}
    >
      <Box display="flex" alignItems="flex-start" gap={2}>
        <Avatar sx={{ bgcolor: message.isGuest ? '#1976d2' : '#757575' }}>
          {message.isGuest ? <Person /> : <Business />}
        </Avatar>
        
        <Box flex={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              {message.author}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.body}
          </Typography>
          
          {children && (
            <Box mt={2}>
              {children}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};