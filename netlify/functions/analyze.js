// Netlify Serverless Function
// This keeps your API key secure on the server

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get API key from environment variable
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.' 
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
    console.error('Analysis error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};

