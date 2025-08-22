/**
 * Enhanced secure storage utility with additional security measures
 */
const secureStorage = {
  // Store values with encryption for sensitive keys
  setItem(key: string, value: string) {
    try {
      // For sensitive keys, apply encryption
      if (this.isSensitiveKey(key)) {
        // Encrypt the value
        const encryptedValue = this.simpleEncrypt(value);
        localStorage.setItem(`secure_${key}`, encryptedValue);
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
      // If it's a sensitive key, decrypt the value
      if (this.isSensitiveKey(key)) {
        const encryptedValue = localStorage.getItem(`secure_${key}`);
        if (!encryptedValue) return null;
        return this.simpleDecrypt(encryptedValue);
      }
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error reading from secure storage', e);
      return null;
    }
  },

  // Remove items with proper key prefixing
  removeItem(key: string) {
    try {
      if (this.isSensitiveKey(key)) {
        localStorage.removeItem(`secure_${key}`);
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Error removing from secure storage', e);
    }
  },

  // Determine which keys contain sensitive information
  isSensitiveKey(key: string): boolean {
    const sensitiveKeys = ['access_token', 'refresh_token'];
    return sensitiveKeys.includes(key);
  },

  // Simple XOR encryption (provides basic obfuscation)
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
