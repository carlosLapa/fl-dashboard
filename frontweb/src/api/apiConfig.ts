import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://fl-backend-app-6v3xd.ondigitalocean.app';
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
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      // Handle 403 Forbidden errors
      if (error.response?.status === 403) {
        console.warn('Permission denied for this operation');

        // For user-related endpoints
        if (error.config?.url?.includes('/users')) {
          console.log('Handling 403 for users endpoint');
          // Return empty result instead of throwing
          return Promise.resolve({
            data: {
              content: [],
              totalPages: 0,
              totalElements: 0,
              size: 10,
              number: 0,
            },
          });
        }

        // For tarefas-related endpoints
        if (error.config?.url?.includes('/tarefas')) {
          console.log('Handling 403 for tarefas endpoint');
          // Return empty result instead of throwing
          return Promise.resolve({
            data: {
              content: [],
              totalPages: 0,
              totalElements: 0,
              size: 10,
              number: 0,
            },
          });
        }

        // For projetos-related endpoints
        if (error.config?.url?.includes('/projetos')) {
          console.log('Handling 403 for projetos endpoint');
          // Return empty result instead of throwing
          return Promise.resolve({
            data: {
              content: [],
              totalPages: 0,
              totalElements: 0,
              size: 10,
              number: 0,
            },
          });
        }

        // For other endpoints, show warning toast
        if (toast) {
          toast.warning('Você não tem permissão para esta operação');
        }
      }

      // Handle 404 errors
      if (error.response?.status === 404) {
        console.warn('Resource not found');

        // For endpoints that return paginated data
        if (
          error.config?.url?.includes('/projetos') ||
          error.config?.url?.includes('/users') ||
          error.config?.url?.includes('/tarefas')
        ) {
          return Promise.resolve({
            data: {
              content: [],
              totalPages: 0,
              totalElements: 0,
              size: 10,
              number: 0,
            },
          });
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

    // For other errors, reject the promise so the component can handle it
    return Promise.reject(error);
  }
);

export default axios;
