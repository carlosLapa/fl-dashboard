import secureStorage from './secureStorage';
import axios from 'api/apiConfig';

/**
 * Generate a cryptographically secure random CSRF token
 */
export const generateCsrfToken = (): string => {
  // Convert Uint8Array to hex string for better compatibility
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const token = Array.from(array, (byte) =>
    ('0' + (byte & 0xff).toString(16)).slice(-2)
  ).join('');

  secureStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Get the current CSRF token or generate a new one if none exists
 */
export const getCsrfToken = (): string => {
  const token = secureStorage.getItem('csrf_token');
  if (!token) {
    return generateCsrfToken();
  }
  return token;
};

/**
 * Setup axios interceptor to include CSRF token in all requests
 */
export const setupCsrfInterceptor = (): number => {
  return axios.interceptors.request.use((config) => {
    // Don't add CSRF token to token endpoint (authentication)
    if (config.url?.includes('/oauth2/token')) {
      return config;
    }

    // Add CSRF token to all other requests
    const token = getCsrfToken();
    config.headers['X-CSRF-Token'] = token;
    return config;
  });
};
