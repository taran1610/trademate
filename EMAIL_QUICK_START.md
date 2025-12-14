# Quick Start: Enable Trade Log Emails

## ✅ What's Already Done

The "Took This Trade" and "Did Not Take" buttons are now fully functional and will send emails automatically when you:
- Click either button
- Enter a reason for your decision
- Have your email set in Settings

## 🚀 Setup (2 Minutes)

### Step 1: Get Resend API Key

1. Go to https://resend.com
2. Sign up (free - 3,000 emails/month)
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `re_...`)

### Step 2: Add to Vercel

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Key**: `RESEND_API_KEY`
   - **Value**: Your Resend API key
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments**
2. Click three dots (⋯) on latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes

### Step 4: Set Your Email

1. Open your app
2. Go to **Settings**
3. Enter your email in "Email for Trade Logs"
4. Click **Save**

## ✅ Test It!

1. Upload a chart (or open an existing session)
2. Click **"Took This Trade"** or **"Did Not Take"**
3. Enter a reason
4. Check your email inbox! 📧

## 📧 What You'll Receive

Each email includes:
- ✅ Decision (Took Trade / Did Not Take)
- ✅ Bias (Long/Short/Neutral)
- ✅ Your reason
- ✅ Outcome (Win/Loss - if recorded later)
- ✅ Timestamps
- ✅ Full AI Analysis

## 🎨 Email Preview

The emails are beautifully formatted with:
- Professional design
- Color-coded decisions (green for took, red for skipped)
- Easy-to-read layout
- All trade details included

## ⚠️ Troubleshooting

### "Email could not be sent"
- Check `RESEND_API_KEY` is set in Vercel
- Make sure you redeployed after adding it
- Check Resend dashboard for delivery status

### No email received
- Check spam/junk folder
- Verify email address in Settings is correct
- Check Resend dashboard for any errors

### "Email service not configured"
- This is normal if `RESEND_API_KEY` isn't set yet
- Trade is still saved, just no email sent
- Follow setup steps above

## 💡 Pro Tips

1. **Verify your domain** (optional): Better deliverability, emails from your domain
2. **Check Resend dashboard**: See delivery status, opens, clicks
3. **Set up webhooks**: Track bounces/failures (optional)

That's it! Your trade log emails are now fully functional! 🎉

