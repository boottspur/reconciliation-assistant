import axios from 'axios';
import { ReconciliationData } from './types';
import { StaticDataService } from './services/staticDataService';

const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
const USE_STATIC_DATA = process.env.NODE_ENV === 'production' || process.env.REACT_APP_USE_STATIC_DATA === 'true';

// Static data service for GitHub Pages deployment
const staticDataService = StaticDataService.getInstance();

export const api = {
  getEventDiscussions: async (eventId: string): Promise<ReconciliationData> => {
    if (USE_STATIC_DATA) {
      return await staticDataService.getEventDiscussions(eventId);
    }
    
    const response = await axios.get(`${API_BASE}/events/${eventId}/discussions`);
    return response.data;
  },

  acceptSuggestion: async (eventId: string, suggestionId: string, field: string, value: any) => {
    if (USE_STATIC_DATA) {
      return await staticDataService.acceptSuggestion(eventId, suggestionId, field, value);
    }
    
    const response = await axios.post(`${API_BASE}/events/${eventId}/reconcile`, {
      suggestionId,
      field,
      value
    });
    return response.data;
  },

  ignoreSuggestion: async (eventId: string, suggestionId: string, field: string, permanent: boolean) => {
    if (USE_STATIC_DATA) {
      return await staticDataService.ignoreSuggestion(eventId, suggestionId, field, permanent);
    }
    
    const response = await axios.post(`${API_BASE}/events/${eventId}/reconcile/ignore`, {
      suggestionId,
      field,
      permanent
    });
    return response.data;
  },

  resetDemo: async () => {
    if (USE_STATIC_DATA) {
      return await staticDataService.resetDemo();
    }
    
    const response = await axios.post(`${API_BASE}/demo/reset`);
    return response.data;
  }
};