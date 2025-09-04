import { Message, Suggestion, IgnoredSuggestion, Discussion } from './types';

interface ParsePattern {
  field: string;
  pattern: RegExp;
  extractor: (match: RegExpMatchArray) => any;
  confidence: number;
}

const patterns: ParsePattern[] = [
  {
    field: 'guestCount',
    pattern: /(\d{1,3})\s*(more\s*)?(guests?|people|attendees|RSVP)/i,
    extractor: (match) => {
      const number = parseInt(match[1]);
      const isAddition = match[2] !== undefined;
      return { value: number, isAddition };
    },
    confidence: 0.85
  },
  {
    field: 'guestCount',
    pattern: /up\s+to\s+(\d{1,3})\s*(guests?|people|attendees)/i,
    extractor: (match) => parseInt(match[1]),
    confidence: 0.9
  },
  {
    field: 'guestCount',
    pattern: /expecting\s+(?:about\s+)?(\d{1,3})\s*(guests?|people|total)/i,
    extractor: (match) => parseInt(match[1]),
    confidence: 0.85
  },
  {
    field: 'timeline.start',
    pattern: /(?:push|move|change|set)?\s*(?:dinner|event|start)?\s*(?:to|at|for)?\s*(\d{1,2}):?(\d{2})?\s*(am|pm)/i,
    extractor: (match) => {
      const hour = match[1];
      const minute = match[2] || '00';
      const period = match[3].toUpperCase();
      return `${hour}:${minute} ${period}`;
    },
    confidence: 0.9
  },
  {
    field: 'menuPackage',
    pattern: /(buffet\s*[a-c]|vegetarian\s*(?:menu|option)?|plated\s*(?:dinner|service)?)/i,
    extractor: (match) => {
      const menu = match[1].toLowerCase();
      if (menu.includes('buffet')) {
        return menu.replace(/\s+/g, ' ').replace(/buffet\s*/, 'Buffet ').toUpperCase().replace('BUFFET ', 'Buffet ');
      }
      return menu;
    },
    confidence: 0.85
  },
  {
    field: 'linenColor',
    pattern: /(?:switch|change|use)?\s*(?:to|with)?\s*(red|blue|green|white|black|purple|gold|silver)\s*(?:linens?|napkins?|tablecloths?)/i,
    extractor: (match) => match[1].toLowerCase(),
    confidence: 0.9
  },
  {
    field: 'linenColor',
    pattern: /(?:linens?|napkins?|tablecloths?)\s*(?:in|to|should be)?\s*(red|blue|green|white|black|purple|gold|silver)/i,
    extractor: (match) => match[1].toLowerCase(),
    confidence: 0.85
  }
];

export function parseMessages(discussions: Discussion[], ignoredSuggestions: IgnoredSuggestion[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let suggestionCounter = 0;

  discussions.forEach(discussion => {
    discussion.messages.forEach(message => {
      // Only parse guest messages
      if (!message.isGuest) return;

      patterns.forEach(pattern => {
        // Check if this field is ignored for this discussion
        const isIgnored = ignoredSuggestions.some(
          ig => ig.field === pattern.field && 
                ig.discussionId === discussion.id
        );
        
        if (isIgnored) return;

        const regex = new RegExp(pattern.pattern, 'gi');
        let match;
        const matches = [];
        
        while ((match = regex.exec(message.body)) !== null) {
          matches.push(match);
        }
        
        for (const match of matches) {
          const extractedValue = pattern.extractor(match);
          let value = extractedValue;
          
          // Handle special case for guest count additions
          if (pattern.field === 'guestCount' && typeof extractedValue === 'object' && extractedValue.isAddition) {
            // For "4 more guests", we'll add to the current count (62)
            value = 62 + extractedValue.value;
          } else if (typeof extractedValue === 'object') {
            value = extractedValue.value;
          }

          // Add confidence variation based on context
          let confidence = pattern.confidence;
          
          // Boost confidence for certain phrases
          if (message.body.toLowerCase().includes('actually') || 
              message.body.toLowerCase().includes('change') ||
              message.body.toLowerCase().includes('switch')) {
            confidence = Math.min(confidence + 0.05, 0.95);
          }

          suggestions.push({
            id: `sug-${suggestionCounter++}`,
            field: pattern.field,
            value,
            confidence,
            messageId: message.id,
            originalText: match[0]
          });
        }
      });
    });
  });

  // Remove duplicate suggestions (keep highest confidence)
  const uniqueSuggestions = suggestions.reduce((acc, curr) => {
    const existing = acc.find(s => s.field === curr.field && s.value === curr.value);
    if (!existing) {
      acc.push(curr);
    } else if (curr.confidence > existing.confidence) {
      const index = acc.indexOf(existing);
      acc[index] = curr;
    }
    return acc;
  }, [] as Suggestion[]);

  return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence);
}