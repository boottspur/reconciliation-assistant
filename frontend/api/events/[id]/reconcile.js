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

let acceptedSuggestions = [];

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
    const { suggestionId, field, value } = req.body;
    
    // Update event data
    const fieldParts = field.split('.');
    let target = currentEventData;
    
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
      event: currentEventData,
      oldValue,
      newValue: value,
      contractUpdateRequired
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}