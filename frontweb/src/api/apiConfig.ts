import axios from 'axios';
import { toast } from 'react-toastify';

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

// response interceptor for global error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error)) {
      // Handle 403 Forbidden errors
      if (error.response?.status === 403) {
        console.warn('Permission denied for this operation');
        if (toast) {
          toast.warning('Você não tem permissão para esta operação');
        }
      }
      
      // Handle 401 Unauthorized errors (e.g., token expired)
      if (error.response?.status === 401) {
        console.error('Authentication error - session may have expired');
        if (toast) {
          toast.error('Sua sessão expirou. Por favor, faça login novamente.');
        }
        // You might want to redirect to login here
        // window.location.href = '/login';
      }
    }
    
    // Always reject the promise so the component can handle the error
    return Promise.reject(error);
  }
);

export default axios;
