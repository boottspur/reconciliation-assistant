import { Event, Discussion, Suggestion, ReconciliationData, IgnoredSuggestion } from '../types';

// Parser logic from backend
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

function parseMessages(discussions: Discussion[], ignoredSuggestions: IgnoredSuggestion[], currentEventData: Event): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let suggestionCounter = 0;

  discussions.forEach(discussion => {
    discussion.messages.forEach(message => {
      if (!message.isGuest) return;

      patterns.forEach(pattern => {
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
          
          if (pattern.field === 'guestCount' && typeof extractedValue === 'object' && extractedValue.isAddition) {
            value = currentEventData.guestCount + extractedValue.value;
          } else if (typeof extractedValue === 'object') {
            value = extractedValue.value;
          }

          let confidence = pattern.confidence;
          
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

// Static data service class
export class StaticDataService {
  private static instance: StaticDataService;
  private currentEventData: Event | null = null;
  private discussions: Discussion[] = [];
  private ignoredSuggestions: IgnoredSuggestion[] = [];
  private acceptedSuggestions: string[] = [];
  private originalEventData: Event | null = null;

  private constructor() {}

  static getInstance(): StaticDataService {
    if (!StaticDataService.instance) {
      StaticDataService.instance = new StaticDataService();
    }
    return StaticDataService.instance;
  }

  async loadInitialData(): Promise<void> {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/data/initial-data.json`);
      const data = await response.json();
      
      this.currentEventData = { ...data.event };
      this.originalEventData = { ...data.event };
      this.discussions = data.discussions;
      this.ignoredSuggestions = [];
      this.acceptedSuggestions = [];
    } catch (error) {
      console.error('Error loading initial data:', error);
      throw error;
    }
  }

  async getEventDiscussions(eventId: string): Promise<ReconciliationData> {
    if (!this.currentEventData) {
      await this.loadInitialData();
    }

    const suggestions = parseMessages(
      this.discussions, 
      this.ignoredSuggestions, 
      this.currentEventData!
    ).filter(s => !this.acceptedSuggestions.includes(s.id));

    return {
      event: this.currentEventData!,
      discussions: this.discussions,
      suggestions
    };
  }

  async acceptSuggestion(eventId: string, suggestionId: string, field: string, value: any) {
    if (!this.currentEventData) {
      throw new Error('Event data not loaded');
    }

    const fieldParts = field.split('.');
    let target: any = this.currentEventData;
    
    for (let i = 0; i < fieldParts.length - 1; i++) {
      target = target[fieldParts[i]];
    }
    
    const oldValue = target[fieldParts[fieldParts.length - 1]];
    target[fieldParts[fieldParts.length - 1]] = value;
    
    this.acceptedSuggestions.push(suggestionId);
    
    const contractUpdateRequired = field === 'guestCount' || field === 'menuPackage';
    
    return {
      success: true,
      event: this.currentEventData,
      oldValue,
      newValue: value,
      contractUpdateRequired
    };
  }

  async ignoreSuggestion(eventId: string, suggestionId: string, field: string, permanent: boolean) {
    if (permanent) {
      this.ignoredSuggestions.push({
        field,
        eventId,
        discussionId: 'disc-001' // Simplified for demo
      });
    } else {
      this.acceptedSuggestions.push(suggestionId);
    }
    
    return { success: true };
  }

  async resetDemo() {
    if (this.originalEventData) {
      this.currentEventData = { ...this.originalEventData };
      this.ignoredSuggestions = [];
      this.acceptedSuggestions = [];
    }
    return { success: true };
  }
}