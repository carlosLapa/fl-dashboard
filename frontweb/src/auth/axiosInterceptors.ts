import axios from 'api/apiConfig';
import secureStorage from './secureStorage';
import { clearTokenData } from './tokenHelpers';

// Queue for handling multiple requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

/**
 * Process all queued requests either with new token or rejection
 */
const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

/**
 * Set up axios interceptor to handle token refresh on 401 errors
 */
export const setupTokenRefreshInterceptor = (
  refreshUserToken: () => Promise<boolean>
) => {
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If the error is not 401 or the request already tried to refresh, reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Try to refresh the token
      try {
        const success = await refreshUserToken();
        if (!success) throw new Error('Token refresh failed');

        const newToken = secureStorage.getItem('access_token');

        // Process the queue with the new token
        processQueue(null, newToken);
        isRefreshing = false;

        // Retry the original request
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return axios(originalRequest);
      } catch (refreshError) {
        // Handle refresh failure - usually means user needs to re-login
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear auth data
        clearTokenData();

        // Dispatch a "session expired" event
        window.dispatchEvent(new Event('auth:sessionExpired'));

        return Promise.reject(refreshError);
      }
    }
  );

  return interceptor;
};
