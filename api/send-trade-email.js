// Vercel Serverless Function: Send Trade Log Email
// Sends email when user makes a trade decision

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, sessionData } = req.body;

    if (!to || !sessionData) {
      return res.status(400).json({ error: 'Missing required fields: to, sessionData' });
    }

    // Use Resend API (free tier: 3,000 emails/month)
    // Alternative: Use SendGrid, Mailgun, or AWS SES
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      // If no email service configured, just log (don't fail)
      console.log('Trade log email (not sent - RESEND_API_KEY not configured):', {
        to,
        decision: sessionData.tradeTaken ? 'TOOK TRADE' : 'DID NOT TAKE',
        bias: sessionData.bias,
        timestamp: new Date(sessionData.timestamp).toLocaleString()
      });
      return res.status(200).json({ 
        success: true, 
        message: 'Email service not configured. Trade logged locally.' 
      });
    }

    const decision = sessionData.tradeTaken ? 'TOOK TRADE' : 'DID NOT TAKE';
    const decisionEmoji = sessionData.tradeTaken ? '✅' : '❌';
    const outcomeText = sessionData.tradeOutcome 
      ? (sessionData.tradeOutcome === 'win' ? '✅ WIN' : '❌ LOSS')
      : 'Pending';

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h2 { margin: 0; font-size: 24px; }
            .content { padding: 30px 20px; }
            .section { margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #2563eb; }
            .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
            .value { margin-top: 8px; font-size: 16px; }
            .decision { display: inline-block; font-size: 18px; font-weight: bold; padding: 12px 20px; border-radius: 8px; margin-top: 8px; }
            .took { background: #dbeafe; color: #1e40af; }
            .skipped { background: #fee2e2; color: #991b1b; }
            .analysis-box { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; white-space: pre-wrap; font-size: 13px; font-family: 'Courier New', monospace; max-height: 300px; overflow-y: auto; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f9fafb; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
            .timestamp { color: #9ca3af; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${decisionEmoji} Trade Decision Log</h2>
            </div>
            <div class="content">
              <div class="section">
                <div class="label">Decision</div>
                <div class="value">
                  <span class="decision ${sessionData.tradeTaken ? 'took' : 'skipped'}">
                    ${escapeHtml(decision)}
                  </span>
                </div>
              </div>
              
              <div class="section">
                <div class="label">Bias</div>
                <div class="value"><strong>${escapeHtml(sessionData.bias.toUpperCase())}</strong></div>
              </div>
              
              ${sessionData.tradeReason ? `
              <div class="section">
                <div class="label">Reason</div>
                <div class="value">${escapeHtml(sessionData.tradeReason)}</div>
              </div>
              ` : ''}
              
              ${sessionData.tradeOutcome ? `
              <div class="section">
                <div class="label">Outcome</div>
                <div class="value"><strong style="font-size: 20px;">${escapeHtml(outcomeText)}</strong></div>
              </div>
              ` : ''}
              
              <div class="section">
                <div class="label">Analysis Timestamp</div>
                <div class="value timestamp">${new Date(sessionData.timestamp).toLocaleString()}</div>
              </div>
              
              ${sessionData.decisionTimestamp ? `
              <div class="section">
                <div class="label">Decision Timestamp</div>
                <div class="value timestamp">${new Date(sessionData.decisionTimestamp).toLocaleString()}</div>
              </div>
              ` : ''}
              
              ${sessionData.analysis ? `
              <div class="section">
                <div class="label">AI Analysis</div>
                <div class="analysis-box">${escapeHtml(sessionData.analysis)}</div>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              <p><strong>TradeScope AI</strong> - Automated Trade Log</p>
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

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'TradeScope AI <onboarding@resend.dev>', // Use Resend's default domain (or update with your verified domain)
        to: [to],
        subject: `${decisionEmoji} Trade Decision: ${decision} - ${sessionData.bias.toUpperCase()}`,
        html: emailHtml,
        text: emailText
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Email API error: ${response.status}`);
    }

    return res.status(200).json({ 
      success: true,
      message: 'Trade log email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending trade email:', error.message);
    // Don't fail the request - email is optional
    return res.status(200).json({ 
      success: false,
      message: 'Email could not be sent, but trade was logged: ' + error.message 
    });
  }
}

