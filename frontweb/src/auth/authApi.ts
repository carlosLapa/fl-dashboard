import axios from 'api/apiConfig';
import { getApiUrl } from 'api/apiConfig';
import secureStorage from './secureStorage';
import { storeTokenData } from './tokenHelpers';

/**
 * Authenticate user with credentials
 * @param email User email
 * @param password User password
 * @returns Token information
 */
export const login = async (email: string, password: string) => {
  const apiUrl = getApiUrl();

  const apiClient = axios.create({
    baseURL: apiUrl,
  });

  const tokenResponse = await apiClient.post(
    '/oauth2/token',
    `grant_type=password&username=${encodeURIComponent(
      email
    )}&password=${encodeURIComponent(password)}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa('myclientid:myclientsecret'),
      },
    }
  );

  const { access_token, refresh_token, token_type, expires_in } =
    tokenResponse.data;

  // Store the email for use in getUserData
  const currentEmail = email;

  // Store tokens and return token info
  return storeTokenData(
    access_token,
    refresh_token,
    token_type,
    expires_in,
    currentEmail
  );
};

/**
 * Refresh the access token using a refresh token
 * @returns boolean Success of the refresh operation
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshTokenStr = secureStorage.getItem('refresh_token');

    if (!refreshTokenStr) {
      throw new Error('No refresh token available');
    }

    const tokenResponse = await axios.post(
      '/oauth2/token',
      `grant_type=refresh_token&refresh_token=${refreshTokenStr}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa('myclientid:myclientsecret'),
        },
      }
    );

    const { access_token, refresh_token, token_type, expires_in } =
      tokenResponse.data;

    // Store tokens
    secureStorage.setItem('access_token', access_token);

    if (refresh_token) {
      secureStorage.setItem('refresh_token', refresh_token);
    }

    // Store expiration time
    if (expires_in) {
      const expiresAt = Date.now() + expires_in * 1000;
      secureStorage.setItem('token_expires_at', expiresAt.toString());
    }

    axios.defaults.headers.common[
      'Authorization'
    ] = `${token_type} ${access_token}`;
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};
