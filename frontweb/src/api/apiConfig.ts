import axios from 'axios';

// Force the API URL to be the backend URL
const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://fl-backend-app-don63.ondigitalocean.app:8080';

console.log('API_URL is set to:', API_URL);

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Export for use in other files
export const getApiUrl = () => API_URL;

// WebSocket URL
export const getWebSocketUrl = () => {
  return `${API_URL}/ws`;
};

// Create and export a configured axios instance
const apiClient = axios.create({
  baseURL: API_URL,
});

export { apiClient };
export default axios;
