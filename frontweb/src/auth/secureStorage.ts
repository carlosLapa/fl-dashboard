/**
 * Secure storage utility for managing authentication tokens
 * Provides a consistent interface for storing/retrieving sensitive data
 */
const secureStorage = {
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error saving to secure storage', e);
    }
  },

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error reading from secure storage', e);
      return null;
    }
  },

  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from secure storage', e);
    }
  },
};

export default secureStorage;
