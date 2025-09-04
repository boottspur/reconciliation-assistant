// Simple in-memory storage for demo
let ignoredSuggestions = [];
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
    const { suggestionId, field, permanent } = req.body;
    const { id: eventId } = req.query;
    
    if (permanent) {
      ignoredSuggestions.push({
        field,
        eventId,
        discussionId: 'disc-001'
      });
    } else {
      acceptedSuggestions.push(suggestionId);
    }
    
    res.json({ success: true });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}