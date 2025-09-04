import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Refresh, PlayArrow } from '@mui/icons-material';
import { MessageBlock } from './components/MessageBlock';
import { SuggestionChips } from './components/SuggestionChips';
import { EventSummary } from './components/EventSummary';
import { DiscussionTabs } from './components/DiscussionTabs';
import { api } from './api';
import { ReconciliationData, Suggestion } from './types';

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReconciliationData | null>(null);
  const [currentDiscussion, setCurrentDiscussion] = useState(0);
  const [contractUpdateRequired, setContractUpdateRequired] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: { old: any; new: any } }>({});
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const eventId = 'evt-001';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await api.getEventDiscussions(eventId);
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
      setNotification({ message: 'Error loading data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: Suggestion) => {
    if (!data) return;

    try {
      const response = await api.acceptSuggestion(eventId, suggestion.id, suggestion.field, suggestion.value);
      
      // Update local state
      const newPendingChanges = { ...pendingChanges };
      newPendingChanges[suggestion.field] = {
        old: response.oldValue,
        new: response.newValue
      };
      setPendingChanges(newPendingChanges);
      
      // Update contract requirement
      if (response.contractUpdateRequired) {
        setContractUpdateRequired(true);
      }
      
      // Remove accepted suggestion
      const newSuggestions = data.suggestions.filter(s => s.id !== suggestion.id);
      setData({
        ...data,
        event: response.event,
        suggestions: newSuggestions
      });
      
      setNotification({ 
        message: `Updated ${suggestion.field} to ${suggestion.value}`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      setNotification({ message: 'Error accepting suggestion', severity: 'error' });
    }
  };

  const handleDiscardSuggestion = async (suggestion: Suggestion) => {
    if (!data) return;

    try {
      await api.ignoreSuggestion(eventId, suggestion.id, suggestion.field, false);
      
      // Remove discarded suggestion
      const newSuggestions = data.suggestions.filter(s => s.id !== suggestion.id);
      setData({
        ...data,
        suggestions: newSuggestions
      });
      
      setNotification({ 
        message: 'Suggestion discarded', 
        severity: 'info' 
      });
    } catch (error) {
      console.error('Error discarding suggestion:', error);
      setNotification({ message: 'Error discarding suggestion', severity: 'error' });
    }
  };

  const handleAddToTasks = async (suggestion: Suggestion) => {
    if (!data) return;

    // For now, just remove the suggestion and show a notification
    // In a real implementation, this would add to a task management system
    const newSuggestions = data.suggestions.filter(s => s.id !== suggestion.id);
    setData({
      ...data,
      suggestions: newSuggestions
    });
    
    const fieldName = {
      'guestCount': 'Guest Count',
      'timeline.start': 'Start Time',
      'menuPackage': 'Menu Package',
      'linenColor': 'Linen Color'
    }[suggestion.field] || suggestion.field;
    
    setNotification({ 
      message: `Task created: Update ${fieldName} to ${suggestion.value}`, 
      severity: 'success' 
    });
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      setContractUpdateRequired(false);
      setPendingChanges({});
      await loadData();
      setNotification({ message: 'Demo reset successfully', severity: 'success' });
    } catch (error) {
      console.error('Error resetting demo:', error);
      setNotification({ message: 'Error resetting demo', severity: 'error' });
    }
  };

  const runDemoScenario = async () => {
    setDemoMode(true);
    setNotification({ message: 'Running demo scenario...', severity: 'info' });
    
    // Auto-accept guest count suggestion
    setTimeout(() => {
      const guestCountSuggestion = data?.suggestions.find(s => s.field === 'guestCount');
      if (guestCountSuggestion) {
        handleAcceptSuggestion(guestCountSuggestion);
      }
    }, 2000);

    // Add timeline change to tasks
    setTimeout(() => {
      const startTimeSuggestion = data?.suggestions.find(s => s.field === 'timeline.start');
      if (startTimeSuggestion) {
        handleAddToTasks(startTimeSuggestion);
      }
    }, 4000);

    // Discard linen color suggestion
    setTimeout(() => {
      const linenSuggestion = data?.suggestions.find(s => s.field === 'linenColor');
      if (linenSuggestion) {
        handleDiscardSuggestion(linenSuggestion);
      }
    }, 6000);

    setTimeout(() => {
      setDemoMode(false);
      setNotification({ message: 'Demo scenario complete!', severity: 'success' });
    }, 8000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error">Failed to load data</Alert>
      </Box>
    );
  }

  const currentDiscussionData = data.discussions[currentDiscussion];
  const discussionSuggestions = data.suggestions.filter(s => 
    currentDiscussionData.messages.some(m => m.id === s.messageId)
  );

  // Count suggestions per discussion
  const suggestionCounts = data.discussions.reduce((acc, discussion) => {
    acc[discussion.id] = data.suggestions.filter(s =>
      discussion.messages.some(m => m.id === s.messageId)
    ).length;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tripleseat Reconciliation Assistant
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<PlayArrow />}
            onClick={runDemoScenario}
            disabled={demoMode}
            sx={{ mr: 2 }}
          >
            Run Demo
          </Button>
          <Button 
            color="inherit" 
            startIcon={<Refresh />}
            onClick={handleResetDemo}
          >
            Reset Demo
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: { xs: 1, md: 2 } }}>
            <Typography variant="h5" gutterBottom>
              Discussions
            </Typography>
            
            <DiscussionTabs
              discussions={data.discussions}
              currentDiscussion={currentDiscussion}
              onDiscussionChange={setCurrentDiscussion}
              suggestionCounts={suggestionCounts}
            />
            
            <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              {currentDiscussionData.messages.map(message => {
                const messageSuggestions = discussionSuggestions.filter(s => s.messageId === message.id);
                
                // Get current values for before/after display
                const getCurrentValue = (field: string) => {
                  if (field.includes('.')) {
                    const parts = field.split('.');
                    let value: any = data.event;
                    for (const part of parts) {
                      value = value[part];
                    }
                    return value;
                  }
                  return (data.event as any)[field];
                };
                
                return (
                  <MessageBlock key={message.id} message={message}>
                    {messageSuggestions.length > 0 && (
                      <SuggestionChips
                        suggestions={messageSuggestions}
                        onAccept={handleAcceptSuggestion}
                        onDiscard={handleDiscardSuggestion}
                        onAddToTasks={handleAddToTasks}
                        currentValue={getCurrentValue(messageSuggestions[0].field)}
                      />
                    )}
                  </MessageBlock>
                );
              })}
            </Box>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: { md: '350px' } }}>
            <EventSummary
              event={data.event}
              contractUpdateRequired={contractUpdateRequired}
              pendingChanges={pendingChanges}
            />
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={notification !== null}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
      >
        <Alert severity={notification?.severity || 'info'} onClose={() => setNotification(null)}>
          {notification?.message || ''}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
