// Storage API mock using localStorage
// This provides a simple key-value storage interface

class StorageAPI {
  constructor() {
    this.prefix = 'trademate_';
  }

  async get(key) {
    try {
      const value = localStorage.getItem(this.prefix + key);
      if (value === null) {
        return null;
      }
      return { value };
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, value);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }

  async delete(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  }

  async list(prefix) {
    try {
      const keys = [];
      const storagePrefix = this.prefix + prefix;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(storagePrefix)) {
          keys.push(key.replace(this.prefix, ''));
        }
      }
      
      return { keys };
    } catch (error) {
      console.error('Storage list error:', error);
      return { keys: [] };
    }
  }
}

// Initialize storage API on window object
if (typeof window !== 'undefined') {
  window.storage = new StorageAPI();
}

export default StorageAPI;

