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

  try {
    // Goes through the backend's /auth/login proxy rather than /oauth2/token directly -
    // the OAuth2 client secret lives only server-side now, never in this bundle.
    const tokenResponse = await apiClient.post('/auth/login', { email, password });

    const { access_token, refresh_token, token_type, expires_in } =
      tokenResponse.data;

    // Store the token data
    return storeTokenData(
      access_token,
      refresh_token,
      token_type,
      expires_in,
      email
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Extrair mensagem de erro do servidor OAuth2
      const errorDescription =
        error.response.data?.error_description ||
        error.response.data?.message ||
        'Credenciais inválidas';

      // Lançar erro com a mensagem específica
      throw new Error(errorDescription);
    }
    throw error;
  }
};

/**
 * Refresh the access token using a refresh token
 * @returns boolean Success of the refresh operation
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    // Get the refresh token - add debug logging
    const refreshTokenStr = secureStorage.getItem('refresh_token');
    console.log('Refresh token present:', !!refreshTokenStr);

    if (!refreshTokenStr) {
      console.warn('No refresh token available in secureStorage');
      return false;
    }

    // Same rationale as login() above: goes through the backend proxy, never holds the secret.
    const tokenResponse = await axios.post('/auth/refresh', {
      refresh_token: refreshTokenStr,
    });

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
