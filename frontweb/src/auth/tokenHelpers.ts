import secureStorage from './secureStorage';

/**
 * Check if the current token is expired or about to expire
 * @returns boolean True if token is expired or expires in less than 5 minutes
 */
export const isTokenExpired = () => {
  const expiresAt = secureStorage.getItem('token_expires_at');
  if (!expiresAt) return true;

  // Return true if token expires in less than 5 minutes
  return Date.now() > Number(expiresAt) - 5 * 60 * 1000;
};

/**
 * Store token data and related information
 */
export const storeTokenData = (
  accessToken: string,
  refreshToken: string | undefined,
  tokenType: string,
  expiresIn: number | undefined,
  email: string
) => {
  // Store tokens securely
  secureStorage.setItem('access_token', accessToken);

  if (refreshToken) {
    secureStorage.setItem('refresh_token', refreshToken);
    console.log('Refresh token stored successfully');
  } else {
    console.warn('No refresh token received from server');
  }

  // Store email for user identification
  secureStorage.setItem('user_email', email);

  // Store expiration time
  const expiresAt = Date.now() + (expiresIn || 3600) * 1000;
  secureStorage.setItem('token_expires_at', expiresAt.toString());

  return { tokenType, accessToken };
};

/**
 * Clear all auth-related data from storage
 */
export const clearTokenData = () => {
  console.log('Clearing all token data');
  secureStorage.removeItem('access_token');
  secureStorage.removeItem('refresh_token');
  secureStorage.removeItem('token_expires_at');
  secureStorage.removeItem('user_email');
};

/**
 * Add sanitization utility for safer logging
 */
export const sanitizeToken = (token: string): string => {
  if (!token) return '[empty]';
  // Only show the first 6 and last 4 characters
  if (token.length > 10) {
    return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;
  }
  return '[protected]';
};
