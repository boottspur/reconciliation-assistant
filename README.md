# Reconciliation Assistant Prototype

A prototype demonstrating an intelligent reconciliation assistant for Tripleseat's Discussions feature. The system automatically parses email threads to surface potential event updates, allowing Event Managers to accept or ignore suggested changes.

## Features

- **Smart Suggestion Extraction**: Regex-based parser identifies potential updates for:
  - Guest count changes
  - Event timing adjustments
  - Menu package selections
  - Linen color preferences

- **Confidence Scoring**: Visual indicators show parsing confidence (green: >90%, orange: 80-90%, red: <80%)

- **Three-Action Workflow**:
  - Accept: Apply the suggestion to event record
  - Ignore Once: Dismiss for this session
  - Ignore Forever: Never show this field suggestion again in this thread

- **Contract Update Detection**: Automatically flags when changes to financial anchors (guest count, menu) require contract updates

- **Before/After Preview**: Shows current vs. proposed values inline

- **Demo Mode**: Pre-scripted scenario demonstrates the reconciliation flow

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, Material-UI
- **Data**: Mock in-memory storage

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server (runs on port 3001):
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend (runs on port 3000):
```bash
cd frontend
npm start
```

3. Open http://localhost:3000 in your browser

## Demo Walkthrough

1. **Initial State**: The app loads with the Johnson Wedding Reception event and three discussion threads

2. **Review Suggestions**: Navigate between discussion tabs to see extracted suggestions under relevant messages

3. **Accept Updates**: Click the green checkmark to accept suggestions - watch the Event Summary update in real-time

4. **Contract Warning**: Accepting guest count or menu changes triggers the "Contract Update Required" banner

5. **Run Demo Mode**: Click "Run Demo" in the header to see an automated workflow

6. **Reset**: Click "Reset Demo" to restore the original state

## Mock Data Scenarios

### Discussion 1: "Final Details - Johnson Wedding"
- Guest count increase: 62 → 66 guests
- Time change: 6:00 PM → 7:30 PM  
- Linen color: white → red
- Menu change: Buffet A → Buffet B

### Discussion 2: "AV Requirements"
- No extractable changes (demonstrates threads without suggestions)

### Discussion 3: "Cake Delivery Coordination"
- Alternative guest count mention (70 people)
- Napkin color specification (blue napkins with red linens)

## Key UI Elements

### Suggestion Chips
- Confidence indicator (colored icon)
- Field name and values (strikethrough for old, bold for new)
- Original text excerpt in italics
- Three action buttons

### Event Summary Sidebar
- Current event details
- Visual before/after comparison for pending changes
- Contract update warning when applicable
- Count of pending updates

## Future Enhancements

- Real AI/NLP integration (GPT-4, Claude, etc.)
- Expanded field coverage (room setup, A/V, catering details)
- Contract regeneration workflow
- Venue-specific dictionaries
- Guest portal integration
- Bulk suggestion management
- Change history/audit trail

## Development Notes

- Parser uses regex patterns with configurable confidence thresholds
- Suggestions are deduplicated by field and value
- "Ignore forever" persists only for the session (would be database-backed in production)
- Demo mode uses setTimeout for scripted interactions