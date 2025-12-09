// Vercel Serverless Function: Save User API Key
// Encrypts and stores user's API key securely

import { encryptApiKey, validateApiKeyFormat } from './lib/encryption.js';
import { verifyUser, saveUserEncryptedKey, isConfigured } from './lib/supabase.js';

// Rate limiting: simple in-memory store (use Redis in production)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute

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

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check Supabase configuration
  if (!isConfigured()) {
    return res.status(500).json({ 
      error: 'Server configuration error: Supabase not configured' 
    });
  }

  try {
    // Get auth token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user and get user ID
    const userId = await verifyUser(token);
    
    // Rate limiting
    if (!checkRateLimit(userId)) {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait before trying again.' 
      });
    }

    // Get API key from request body
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Validate API key format
    const validation = validateApiKeyFormat(apiKey);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Encrypt the API key
    const encryptedKey = encryptApiKey(apiKey.trim());

    // Save to database
    await saveUserEncryptedKey(userId, encryptedKey);

    // Never log or return the key
    return res.status(200).json({ 
      success: true,
      message: 'API key saved successfully' 
    });

  } catch (error) {
    console.error('Error saving API key:', error.message);
    // Never expose internal errors or keys
    return res.status(500).json({ 
      error: 'Failed to save API key. Please try again.' 
    });
  }
}

