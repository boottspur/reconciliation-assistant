import React from 'react';
import { Box, Paper, Typography, Divider, Alert, Chip } from '@mui/material';
import { Warning, CheckCircle } from '@mui/icons-material';
import { Event } from '../types';

interface EventSummaryProps {
  event: Event;
  contractUpdateRequired: boolean;
  pendingChanges: { [key: string]: { old: any; new: any } };
}

export const EventSummary: React.FC<EventSummaryProps> = ({ 
  event, 
  contractUpdateRequired,
  pendingChanges 
}) => {
  const getDisplayValue = (field: string, value: any) => {
    if (pendingChanges[field]) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography 
            component="span" 
            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
          >
            {pendingChanges[field].old}
          </Typography>
          <Typography 
            component="span" 
            sx={{ color: 'success.main', fontWeight: 'bold' }}
          >
            {pendingChanges[field].new}
          </Typography>
          <Chip 
            label="Updated" 
            size="small" 
            color="success" 
            sx={{ height: 20 }}
          />
        </Box>
      );
    }
    return <Typography component="span">{value}</Typography>;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Event Summary
      </Typography>
      
      {contractUpdateRequired && (
        <Alert 
          severity="warning" 
          icon={<Warning />}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Contract Update Required
          </Typography>
          <Typography variant="caption">
            Changes to guest count or menu package require a contract update.
          </Typography>
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {event.name}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {event.venue} • {event.date}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ '& > div': { mb: 2 } }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Guest Count
          </Typography>
          <Box>
            {getDisplayValue('guestCount', event.guestCount)}
          </Box>
        </Box>
        
        <Box>
          <Typography variant="caption" color="text.secondary">
            Event Time
          </Typography>
          <Box>
            {getDisplayValue('timeline.start', event.timeline.start)} - {event.timeline.end}
          </Box>
        </Box>
        
        <Box>
          <Typography variant="caption" color="text.secondary">
            Menu Package
          </Typography>
          <Box>
            {getDisplayValue('menuPackage', event.menuPackage)}
          </Box>
        </Box>
        
        <Box>
          <Typography variant="caption" color="text.secondary">
            Linen Color
          </Typography>
          <Box>
            {getDisplayValue('linenColor', event.linenColor)}
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="caption" color="text.secondary">
            Contact
          </Typography>
          <Typography variant="body2">
            {event.contact.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.contact.email}
          </Typography>
        </Box>
      </Box>
      
      {Object.keys(pendingChanges).length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            <Typography variant="subtitle2" fontWeight="bold">
              {Object.keys(pendingChanges).length} pending update{Object.keys(pendingChanges).length > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};