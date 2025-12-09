// Server-side AES-256-GCM Encryption/Decryption Utilities (Netlify)
// Production-safe encryption for API keys

const crypto = require('crypto');

const getEncryptionSecret = () => {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is required');
  }
  return crypto.createHash('sha256').update(secret).digest();
};

const deriveKey = (secret, salt) => {
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
};

const encryptApiKey = (plaintext) => {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Invalid API key provided');
  }

  const secret = getEncryptionSecret();
  const iv = crypto.randomBytes(16);
  const salt = crypto.randomBytes(16);
  
  const key = deriveKey(secret, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, 'base64')
  ]);
  
  return combined.toString('base64');
};

const decryptApiKey = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new Error('Invalid encrypted data provided');
  }

  try {
    const secret = getEncryptionSecret();
    const combined = Buffer.from(encryptedData, 'base64');
    
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 32);
    const authTag = combined.slice(32, 48);
    const encrypted = combined.slice(48);
    
    const key = deriveKey(secret, salt);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt API key: ' + error.message);
  }
};

const validateApiKeyFormat = (key) => {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'API key is required' };
  }
  
  const trimmed = key.trim();
  if (trimmed.length < 10) {
    return { valid: false, error: 'API key is too short' };
  }
  
  if (!trimmed.startsWith('sk-ant-')) {
    return { valid: false, error: 'Invalid API key format. Must start with sk-ant-' };
  }
  
  return { valid: true };
};

module.exports = {
  encryptApiKey,
  decryptApiKey,
  validateApiKeyFormat
};

