import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://fl-backend-app-6v3xd.ondigitalocean.app';
//console.log('API_URL is set to:', API_URL);

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Export for use in other files
export const getApiUrl = () => API_URL;

// WebSocket URL
export const getWebSocketUrl = () => {
  return `${API_URL}/ws`;
};

// Paginated-shape empty result used to degrade list fetches gracefully.
const emptyPage = () =>
  Promise.resolve({
    data: {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: 10,
      number: 0,
    },
  });

// URLs whose forbidden/not-found reads degrade to an empty list. The nested
// subtarefas sub-resource is excluded: it needs real 403s to propagate.
const isDegradableUrl = (url?: string) =>
  !!url &&
  (url.includes('/users') ||
    url.includes('/projetos') ||
    (url.includes('/tarefas') && !url.includes('/subtarefas')));

// Only reads may be degraded. A refused write (POST/PUT/PATCH/DELETE) must
// reject, otherwise the UI reports "saved successfully" for a change the
// backend never applied.
const isReadRequest = (method?: string) =>
  (method ?? 'get').toLowerCase() === 'get';

// response interceptor for global error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const degradable =
        isReadRequest(error.config?.method) &&
        isDegradableUrl(error.config?.url);

      // Handle 403 Forbidden errors
      if (status === 403) {
        // For reads on users/tarefas/projetos, return an empty result instead
        // of throwing (e.g. an EMPLOYEE sees an empty list, not an error).
        if (degradable) {
          return emptyPage();
        }

        // For other endpoints (and every refused write), show a warning toast.
        // The fixed toastId makes react-toastify skip a new toast while one is
        // still visible, so a page firing several requests in parallel that all
        // get 403 shows a single warning instead of a stack.
        if (toast) {
          toast.warning('Você não tem permissão para esta operação', {
            toastId: 'permission-denied',
          });
        }
      }

      // Handle 404 errors: same read-only degrade for paginated endpoints.
      if (status === 404 && degradable) {
        return emptyPage();
      }

      // Handle 401 Unauthorized errors (e.g., token expired)
      if (status === 401) {
        //console.error('Authentication error - session may have expired');
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
