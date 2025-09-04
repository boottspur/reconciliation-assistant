export interface Message {
  id: string;
  author: string;
  timestamp: string;
  body: string;
  isGuest: boolean;
}

export interface Discussion {
  id: string;
  eventId: string;
  title: string;
  messages: Message[];
}

export interface Suggestion {
  id: string;
  field: string;
  value: any;
  confidence: number;
  messageId: string;
  originalText?: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  guestCount: number;
  timeline: {
    start: string;
    end: string;
  };
  menuPackage: string;
  linenColor: string;
  venue: string;
  contact: {
    name: string;
    email: string;
  };
}

export interface IgnoredSuggestion {
  field: string;
  eventId: string;
  discussionId: string;
}