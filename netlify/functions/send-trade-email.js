// Netlify Serverless Function: Send Trade Log Email

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, sessionData } = JSON.parse(event.body);

    if (!to || !sessionData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: to, sessionData' })
      };
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.log('Trade log email (not sent - RESEND_API_KEY not configured):', {
        to,
        decision: sessionData.tradeTaken ? 'TOOK TRADE' : 'DID NOT TAKE',
        bias: sessionData.bias,
        timestamp: new Date(sessionData.timestamp).toLocaleString()
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Email service not configured. Trade logged locally.' 
        })
      };
    }

    const decision = sessionData.tradeTaken ? 'TOOK TRADE' : 'DID NOT TAKE';
    const decisionEmoji = sessionData.tradeTaken ? '✅' : '❌';
    const outcomeText = sessionData.tradeOutcome 
      ? (sessionData.tradeOutcome === 'win' ? '✅ WIN' : '❌ LOSS')
      : 'Pending';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .section { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; }
            .label { font-weight: bold; color: #6b7280; }
            .value { margin-top: 5px; }
            .decision { font-size: 18px; font-weight: bold; padding: 10px; border-radius: 6px; }
            .took { background: #dbeafe; color: #1e40af; }
            .skipped { background: #fee2e2; color: #991b1b; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${decisionEmoji} Trade Decision Log</h2>
            </div>
            <div class="content">
              <div class="section">
                <div class="label">Decision:</div>
                <div class="value">
                  <span class="decision ${sessionData.tradeTaken ? 'took' : 'skipped'}">
                    ${decision}
                  </span>
                </div>
              </div>
              
              <div class="section">
                <div class="label">Bias:</div>
                <div class="value"><strong>${sessionData.bias.toUpperCase()}</strong></div>
              </div>
              
              ${sessionData.tradeReason ? `
              <div class="section">
                <div class="label">Reason:</div>
                <div class="value">${sessionData.tradeReason}</div>
              </div>
              ` : ''}
              
              ${sessionData.tradeOutcome ? `
              <div class="section">
                <div class="label">Outcome:</div>
                <div class="value"><strong>${outcomeText}</strong></div>
              </div>
              ` : ''}
              
              <div class="section">
                <div class="label">Analysis Timestamp:</div>
                <div class="value">${new Date(sessionData.timestamp).toLocaleString()}</div>
              </div>
              
              ${sessionData.decisionTimestamp ? `
              <div class="section">
                <div class="label">Decision Timestamp:</div>
                <div class="value">${new Date(sessionData.decisionTimestamp).toLocaleString()}</div>
              </div>
              ` : ''}
              
              ${sessionData.analysis ? `
              <div class="section">
                <div class="label">AI Analysis:</div>
                <div class="value" style="white-space: pre-wrap; font-size: 12px; max-height: 200px; overflow-y: auto;">${sessionData.analysis}</div>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>TradeScope AI - Automated Trade Log</p>
              <p>This is an automated email from your trading journal.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
TRADE DECISION LOG
==================

Decision: ${decision}
Bias: ${sessionData.bias.toUpperCase()}
${sessionData.tradeReason ? `Reason: ${sessionData.tradeReason}\n` : ''}
${sessionData.tradeOutcome ? `Outcome: ${outcomeText}\n` : ''}
Analysis Timestamp: ${new Date(sessionData.timestamp).toLocaleString()}
${sessionData.decisionTimestamp ? `Decision Timestamp: ${new Date(sessionData.decisionTimestamp).toLocaleString()}\n` : ''}

${sessionData.analysis ? `AI Analysis:\n${sessionData.analysis}\n` : ''}

---
TradeScope AI - Automated Trade Log
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'TradeScope AI <onboarding@resend.dev>',
        to: [to],
        subject: `${decisionEmoji} Trade Decision: ${decision}`,
        html: emailHtml,
        text: emailText
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Email API error: ${response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Trade log email sent successfully' 
      })
    };

  } catch (error) {
    console.error('Error sending trade email:', error.message);
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: false,
        message: 'Email could not be sent, but trade was logged: ' + error.message 
      })
    };
  }
};

