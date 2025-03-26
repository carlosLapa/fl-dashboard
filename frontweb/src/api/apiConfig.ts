import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://fl-backend-app-6v3xd.ondigitalocean.app';
console.log('API_URL is set to:', API_URL);

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Export for use in other files
export const getApiUrl = () => API_URL;

// WebSocket URL
export const getWebSocketUrl = () => {
  return `${API_URL}/ws`;
};

export default axios;
