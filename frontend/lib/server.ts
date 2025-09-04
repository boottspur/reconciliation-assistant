import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { mockData } from './mockData';
import { parseMessages } from './parser';
import { Suggestion, Event, IgnoredSuggestion } from './types';

const app: Express = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory store
let eventData: Event = { ...mockData.event };
let ignoredSuggestions: IgnoredSuggestion[] = [];
let acceptedSuggestions: string[] = [];

// Routes
app.get('/api/events/:id/discussions', (req: Request, res: Response) => {
  const suggestions = parseMessages(mockData.discussions, ignoredSuggestions);
  res.json({
    event: eventData,
    discussions: mockData.discussions,
    suggestions: suggestions.filter(s => !acceptedSuggestions.includes(s.id))
  });
});

app.post('/api/events/:id/reconcile', (req: Request, res: Response) => {
  const { suggestionId, field, value } = req.body;
  
  // Update event data
  const fieldParts = field.split('.');
  let target: any = eventData;
  
  for (let i = 0; i < fieldParts.length - 1; i++) {
    target = target[fieldParts[i]];
  }
  
  const oldValue = target[fieldParts[fieldParts.length - 1]];
  target[fieldParts[fieldParts.length - 1]] = value;
  
  // Mark suggestion as accepted
  acceptedSuggestions.push(suggestionId);
  
  // Check if contract update is required
  const contractUpdateRequired = field === 'guestCount' || field === 'menuPackage';
  
  res.json({
    success: true,
    event: eventData,
    oldValue,
    newValue: value,
    contractUpdateRequired
  });
});

app.post('/api/events/:id/reconcile/ignore', (req: Request, res: Response) => {
  const { suggestionId, field, permanent } = req.body;
  
  if (permanent) {
    ignoredSuggestions.push({
      field,
      eventId: req.params.id,
      discussionId: mockData.discussions[0].id
    });
  } else {
    acceptedSuggestions.push(suggestionId);
  }
  
  res.json({ success: true });
});

// Demo mode endpoint
app.post('/api/demo/reset', (req: Request, res: Response) => {
  eventData = { ...mockData.event };
  ignoredSuggestions = [];
  acceptedSuggestions = [];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});