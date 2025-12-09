// Netlify Serverless Function
// Uses user's own encrypted API key - BYOK (Bring Your Own Key) model

const { decryptApiKey } = require('../lib/encryption.js');
const { verifyUser, getUserEncryptedKey, isConfigured } = require('../lib/supabase.js');

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
        body: JSON.stringify({ error: 'Missing or invalid authorization token. Please sign in.' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = await verifyUser(token);
    
    const encryptedKey = await getUserEncryptedKey(userId);
    
    // HARD LOCK: Block request if no API key exists
    if (!encryptedKey) {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: 'No API key on file. Please add your API key in Settings before using this feature.' 
        })
      };
    }

    // Decrypt the API key at runtime
    let apiKey;
    try {
      apiKey = decryptApiKey(encryptedKey);
    } catch (decryptError) {
      console.error('Decryption error:', decryptError.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to decrypt API key. Please update your key in Settings.' 
        })
      };
    }

  try {
    const { imageData, imageType } = JSON.parse(event.body);

    if (!imageData || !imageType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing image data' })
      };
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
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: errorData.error?.message || `API error: ${response.status}` 
        })
      };
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Invalid API response: missing or empty content array' 
        })
      };
    }
    
    const firstContent = data.content[0];
    if (!firstContent || typeof firstContent.text !== 'string') {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Invalid API response: content[0].text is missing or invalid' 
        })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ analysis: firstContent.text })
    };
  } catch (error) {
    console.error('Analysis error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

