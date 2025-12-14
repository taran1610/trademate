# Email Setup Guide - Trade Log Emails

## Overview

Trade log emails are sent automatically when you:
- ✅ Take a trade (or skip it)
- ✅ Record a trade outcome (win/loss)

## Setup Steps

### Option 1: Resend (Recommended - Free Tier: 3,000 emails/month)

1. **Sign up for Resend**: https://resend.com
2. **Get API Key**:
   - Go to API Keys section
   - Create a new API key
   - Copy the key

3. **Add to Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add new variable:
     - **Name**: `RESEND_API_KEY`
     - **Value**: Your Resend API key
     - **Environment**: Production, Preview, Development (select all)
   - Click **Save**

4. **Verify Domain** (Optional but recommended):
   - In Resend dashboard, go to Domains
   - Add your domain (e.g., `tradescope.ai`)
   - Follow DNS setup instructions
   - Update `from` address in `api/send-trade-email.js` to use your domain

5. **Redeploy**:
   - Go to Deployments → Click three dots → Redeploy

### Option 2: SendGrid

1. **Sign up for SendGrid**: https://sendgrid.com
2. **Get API Key**:
   - Go to Settings → API Keys
   - Create API key with "Mail Send" permissions
   - Copy the key

3. **Update Code**:
   - Modify `api/send-trade-email.js` to use SendGrid API instead of Resend
   - Replace Resend API call with SendGrid equivalent

4. **Add to Vercel**:
   - Add `SENDGRID_API_KEY` to environment variables
   - Redeploy

### Option 3: Mailgun

1. **Sign up for Mailgun**: https://mailgun.com
2. **Get API Key** from dashboard
3. **Update code** to use Mailgun API
4. **Add `MAILGUN_API_KEY`** to Vercel
5. **Redeploy**

## Testing

1. **Set your email** in Settings
2. **Take or skip a trade** on any chart
3. **Check your inbox** (and spam folder)
4. **You should receive** an email with trade details

## Email Content

Each email includes:
- ✅ Decision (Took Trade / Did Not Take)
- ✅ Bias (Long/Short/Neutral)
- ✅ Reason (if provided)
- ✅ Outcome (Win/Loss - if recorded)
- ✅ Timestamps
- ✅ Full AI Analysis

## Troubleshooting

### "Email service not configured"
- Add `RESEND_API_KEY` to Vercel environment variables
- Redeploy after adding

### Emails not arriving
- Check spam/junk folder
- Verify email address in Settings is correct
- Check Resend dashboard for delivery status
- Verify domain is verified (if using custom domain)

### "Invalid API key"
- Double-check the API key is correct
- Make sure there are no extra spaces
- Regenerate the key if needed

## Free Tier Limits

- **Resend**: 3,000 emails/month (free)
- **SendGrid**: 100 emails/day (free)
- **Mailgun**: 5,000 emails/month (free)

For most users, Resend's free tier is sufficient.

## Production Recommendations

1. **Verify your domain** for better deliverability
2. **Set up SPF/DKIM records** (Resend provides instructions)
3. **Monitor email delivery** in your email service dashboard
4. **Set up webhooks** to track bounces/failures (optional)

