// Netlify Serverless Function: Save User API Key
// Encrypts and stores user's API key securely

const { encryptApiKey, validateApiKeyFormat } = require('../lib/encryption.js');
const { verifyUser, saveUserEncryptedKey, isConfigured } = require('../lib/supabase.js');

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userLimit = rateLimit.get(userId);
  
  if (!userLimit || now - userLimit.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimit.set(userId, { firstRequest: now, count: 1 });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  if (!isConfigured()) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: Supabase not configured' })
    };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing or invalid authorization token' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = await verifyUser(token);
    
    if (!checkRateLimit(userId)) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Too many requests. Please wait before trying again.' })
      };
    }

    const { apiKey } = JSON.parse(event.body);
    
    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'API key is required' })
      };
    }

    const validation = validateApiKeyFormat(apiKey);
    if (!validation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: validation.error })
      };
    }

    const encryptedKey = encryptApiKey(apiKey.trim());
    await saveUserEncryptedKey(userId, encryptedKey);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'API key saved successfully' })
    };

  } catch (error) {
    console.error('Error saving API key:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save API key. Please try again.' })
    };
  }
};

