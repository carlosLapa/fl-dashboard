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
  secureStorage.setItem('access_token', accessToken);

  if (refreshToken) {
    secureStorage.setItem('refresh_token', refreshToken);
  }

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
  secureStorage.removeItem('access_token');
  secureStorage.removeItem('refresh_token');
  secureStorage.removeItem('token_expires_at');
  secureStorage.removeItem('user_email');
};
