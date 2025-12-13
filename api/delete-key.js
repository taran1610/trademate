// Vercel Serverless Function: Delete User API Key
// Removes user's encrypted API key from database

import { verifyUser, deleteUserEncryptedKey, isConfigured } from './lib/supabase.js';

// Rate limiting
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
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
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

    // Delete from database
    await deleteUserEncryptedKey(userId);

    return res.status(200).json({ 
      success: true,
      message: 'API key deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting API key:', error.message);
    return res.status(500).json({ 
      error: 'Failed to delete API key. Please try again.' 
    });
  }
}

