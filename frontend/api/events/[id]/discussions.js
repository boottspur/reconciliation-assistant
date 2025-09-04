// Import mock data and parser
const mockData = {
  event: {
    id: 'evt-001',
    name: 'Johnson Wedding Reception',
    date: '2024-06-15',
    guestCount: 62,
    timeline: {
      start: '6:00 PM',
      end: '11:00 PM'
    },
    menuPackage: 'Buffet A',
    linenColor: 'white',
    venue: 'Grand Ballroom',
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com'
    }
  },
  discussions: [
    {
      id: 'disc-001',
      eventId: 'evt-001',
      title: 'Final Details - Johnson Wedding',
      messages: [
        {
          id: 'msg-001',
          author: 'Emily Chen (Event Manager)',
          timestamp: '2024-05-10T10:30:00Z',
          body: 'Hi Sarah! Just confirming the details for your upcoming reception. We have 62 guests confirmed, dinner at 6:00 PM with Buffet A, and white linens as discussed. Please let me know if you need any changes.',
          isGuest: false
        },
        {
          id: 'msg-002',
          author: 'Sarah Johnson',
          timestamp: '2024-05-10T14:15:00Z',
          body: 'Hi Emily! Actually, we just had 4 more RSVPs come in, so we\'re up to 66 guests now. Also, can we push dinner to 7:30 PM? My family is flying in and might be running late.',
          isGuest: true
        },
        {
          id: 'msg-003',
          author: 'Sarah Johnson',
          timestamp: '2024-05-10T14:20:00Z',
          body: 'Oh, and I was thinking - could we switch to red linens instead? I think it would match our flowers better.',
          isGuest: true
        },
        {
          id: 'msg-004',
          author: 'Emily Chen (Event Manager)',
          timestamp: '2024-05-10T15:00:00Z',
          body: 'Absolutely! I can make those changes. Let me update everything in our system.',
          isGuest: false
        },
        {
          id: 'msg-005',
          author: 'Sarah Johnson',
          timestamp: '2024-05-11T09:00:00Z',
          body: 'One more thing - my cousin is vegetarian. Can we switch from Buffet A to Buffet B? I saw it has more vegetarian options.',
          isGuest: true
        },
        {
          id: 'msg-006',
          author: 'Emily Chen (Event Manager)',
          timestamp: '2024-05-11T10:30:00Z',
          body: 'Of course! Buffet B is a great choice with plenty of vegetarian options. I\'ll update the menu selection.',
          isGuest: false
        }
      ]
    }
  ]
};

// Simple in-memory storage for demo
let currentEventData = { ...mockData.event };
let ignoredSuggestions = [];
let acceptedSuggestions = [];

// Parser function
function parseMessages(discussions, ignoredSuggestions) {
  const patterns = [
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
    }
  ];

  const suggestions = [];
  let suggestionCounter = 0;

  discussions.forEach(discussion => {
    discussion.messages.forEach(message => {
      if (!message.isGuest) return;

      patterns.forEach(pattern => {
        const isIgnored = ignoredSuggestions.some(
          ig => ig.field === pattern.field && ig.discussionId === discussion.id
        );
        
        if (isIgnored) return;

        const matches = message.body.matchAll(new RegExp(pattern.pattern, 'gi'));
        
        for (const match of matches) {
          const extractedValue = pattern.extractor(match);
          let value = extractedValue;
          
          if (pattern.field === 'guestCount' && typeof extractedValue === 'object' && extractedValue.isAddition) {
            value = 62 + extractedValue.value;
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

  return suggestions.reduce((acc, curr) => {
    const existing = acc.find(s => s.field === curr.field && s.value === curr.value);
    if (!existing) {
      acc.push(curr);
    } else if (curr.confidence > existing.confidence) {
      const index = acc.indexOf(existing);
      acc[index] = curr;
    }
    return acc;
  }, []).sort((a, b) => b.confidence - a.confidence);
}

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const suggestions = parseMessages(mockData.discussions, ignoredSuggestions);
    res.json({
      event: currentEventData,
      discussions: mockData.discussions,
      suggestions: suggestions.filter(s => !acceptedSuggestions.includes(s.id))
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}