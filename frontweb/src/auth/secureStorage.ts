/**
 * Enhanced secure storage utility with additional security measures
 */
const secureStorage = {
  // Add encryption for sensitive values
  setItem(key: string, value: string) {
    try {
      // For sensitive keys, consider simple encryption
      if (this.isSensitiveKey(key)) {
        // Simple XOR encryption
        const encryptedValue = this.simpleEncrypt(value);
        // Add a prefix to identify encrypted values
        localStorage.setItem(key, `ENC:${encryptedValue}`);
        console.log(`Stored encrypted value for key: ${key}`);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Error saving to secure storage', e);
    }
  },

  // Retrieve and decrypt values for sensitive keys
  getItem(key: string): string | null {
    try {
      // Get the stored value
      const storedValue = localStorage.getItem(key);

      // If there's no value or it's not sensitive, return directly
      if (!storedValue) return null;
      if (!this.isSensitiveKey(key)) return storedValue;

      // For encrypted values (check for prefix)
      if (storedValue.startsWith('ENC:')) {
        const encryptedValue = storedValue.substring(4); // Remove 'ENC:' prefix
        return this.simpleDecrypt(encryptedValue);
      }

      // For backward compatibility - return the value as-is if not encrypted
      return storedValue;
    } catch (e) {
      console.error(`Error reading from secure storage for key ${key}:`, e);
      return null;
    }
  },

  // Remove items with proper key prefixing
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from secure storage', e);
    }
  },

  // Determine which keys contain sensitive information
  isSensitiveKey(key: string): boolean {
    const sensitiveKeys = ['access_token', 'refresh_token'];
    return sensitiveKeys.includes(key);
  },

  // Simple XOR encryption
  simpleEncrypt(text: string): string {
    const key =
      process.env.REACT_APP_SECURITY_KEY || 'X7bF9pQ2zK4rT8mE5vN3wL6sJ1yH9cD0';
    let result = '';

    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }

    return btoa(result); // Base64 encode for storage
  },

  // Simple XOR decryption (XOR is symmetric)
  simpleDecrypt(encryptedText: string): string {
    try {
      const decoded = atob(encryptedText); // Base64 decode
      const key =
        process.env.REACT_APP_SECURITY_KEY ||
        'X7bF9pQ2zK4rT8mE5vN3wL6sJ1yH9cD0';
      let result = '';

      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }

      return result;
    } catch (e) {
      console.error('Error decrypting value:', e);
      return '';
    }
  },
};

export default secureStorage;
