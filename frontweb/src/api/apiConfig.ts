import axios from 'axios';

// Base API URL - empty for production (to use relative URLs with nginx proxy)
// or localhost for development
const API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : process.env.REACT_APP_API_URL || '';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Export for use in other files
export const getApiUrl = () => API_URL;

// WebSocket URL with fallback for development
export const getWebSocketUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080/ws';
  }

  // In production, use relative URL if REACT_APP_API_URL is empty
  // or the full URL if it's specified
  return API_URL ? `${API_URL}/ws` : '/ws';
};

export default axios;
