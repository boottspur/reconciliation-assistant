// Simple in-memory storage for demo
let currentEventData = {
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
};

let ignoredSuggestions = [];
let acceptedSuggestions = [];

const originalEventData = { ...currentEventData };

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    currentEventData = { ...originalEventData };
    ignoredSuggestions = [];
    acceptedSuggestions = [];
    res.json({ success: true });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}