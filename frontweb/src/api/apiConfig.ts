import axios from 'axios';

// Base API URL - use REACT_APP_API_URL for both production and development
// with fallback to localhost for development
const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '');

console.log('API_URL is set to:', API_URL);
console.log('Environment variable value:', process.env.REACT_APP_API_URL);

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Export for use in other files
export const getApiUrl = () => API_URL;

// WebSocket URL
export const getWebSocketUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080/ws';
  }

  // In production, always use the full URL for WebSockets
  return `${API_URL}/ws`;
};

export default axios;
