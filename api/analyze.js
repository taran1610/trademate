// Vercel Serverless Function
// Uses user's own encrypted API key - BYOK (Bring Your Own Key) model

import { decryptApiKey } from './lib/encryption.js';
import { verifyUser, getUserEncryptedKey, isConfigured } from './lib/supabase.js';

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
      return res.status(401).json({ 
        error: 'Missing or invalid authorization token. Please sign in.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user and get user ID
    const userId = await verifyUser(token);
    
    // Get user's encrypted API key from database
    const encryptedKey = await getUserEncryptedKey(userId);
    
    // HARD LOCK: Block request if no API key exists
    if (!encryptedKey) {
      return res.status(403).json({ 
        error: 'No API key on file. Please add your API key in Settings before using this feature.' 
      });
    }

    // Decrypt the API key at runtime
    let apiKey;
    try {
      apiKey = decryptApiKey(encryptedKey);
    } catch (decryptError) {
      console.error('Decryption error:', decryptError.message);
      return res.status(500).json({ 
        error: 'Failed to decrypt API key. Please update your key in Settings.' 
      });
    }

  try {
    const { imageData, imageType } = req.body;

    if (!imageData || !imageType) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // Forward request to Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageType,
                data: imageData
              }
            },
            {
              type: "text",
              text: `Analyze this trading chart image. Provide a structured analysis with:

1. TREND DIRECTION: (Bullish/Bearish/Ranging)

2. SWING HIGHS & LOWS: Identify key levels

3. FAIR VALUE GAPS: Any imbalances detected?

4. BREAK OF STRUCTURE: Has structure been broken?

5. BIAS: (Long/Short/Neutral)

6. ENTRY ZONE: Suggested entry price/zone

7. STOP LOSS: Suggested SL level

8. TAKE PROFIT: Suggested TP level(s)

9. CONFIDENCE: (High/Medium/Low)

10. NOTES: Any additional observations

Be concise and actionable. Focus on ICT concepts and price action.`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        error: errorData.error?.message || `API error: ${response.status}` 
      });
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
      return res.status(500).json({ 
        error: 'Invalid API response: missing or empty content array' 
      });
    }
    
    const firstContent = data.content[0];
    if (!firstContent || typeof firstContent.text !== 'string') {
      return res.status(500).json({ 
        error: 'Invalid API response: content[0].text is missing or invalid' 
      });
    }
    
    return res.status(200).json({ analysis: firstContent.text });
  } catch (error) {
    // Never log API keys or sensitive data
    console.error('Analysis error:', error.message);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

