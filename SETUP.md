# Setup Guide - Secure API Key Configuration

This guide shows you how to securely configure your Anthropic API key so it's never exposed to the client.

## 🔒 Security Overview

Your API key is now stored as a **server-side environment variable** and is never exposed to the browser. The frontend calls a secure serverless function that proxies requests to Anthropic.

## 📋 Setup Steps

### Option 1: Vercel (Recommended)

1. **Deploy to Vercel**:
   - Push your code to GitHub
   - Import project in Vercel
   - Deploy (don't worry about the API key yet)

2. **Add Environment Variable**:
   - Go to your project in Vercel dashboard
   - Click **Settings** → **Environment Variables**
   - Add new variable:
     - **Name**: `ANTHROPIC_API_KEY`
     - **Value**: Your API key from [Anthropic Console](https://console.anthropic.com/)
     - **Environment**: Production, Preview, Development (select all)
   - Click **Save**

3. **Redeploy**:
   - Go to **Deployments**
   - Click the three dots on latest deployment
   - Click **Redeploy**

4. **Test**:
   - Upload a chart image
   - It should work without any API key in the browser!

### Option 2: Netlify

1. **Deploy to Netlify**:
   - Push your code to GitHub
   - Import project in Netlify
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Deploy

2. **Add Environment Variable**:
   - Go to **Site settings** → **Environment variables**
   - Click **Add a variable**
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key
   - **Scopes**: All scopes (Production, Deploy previews, Branch deploys)
   - Click **Save**

3. **Redeploy**:
   - Go to **Deploys**
   - Click **Trigger deploy** → **Clear cache and deploy site**

4. **Update Function Path** (if needed):
   - The app will try `/api/analyze` first
   - If that doesn't work, update `getApiEndpoint()` in `TradeScopeAI.jsx` to return `/.netlify/functions/analyze`

### Option 3: Local Development

1. **Install Vercel CLI** (for local serverless functions):
   ```bash
   npm install -g vercel
   ```

2. **Create `.env.local` file** in project root:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ```

3. **Run Vercel dev server**:
   ```bash
   vercel dev
   ```
   This will start both the frontend and API functions locally.

4. **Or use Vite dev server** (API won't work, but UI will):
   ```bash
   npm run dev
   ```
   Note: You'll need to deploy to test the API functionality.

## ✅ Verification

To verify your API key is secure:

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Upload a chart**
4. **Check the request to `/api/analyze`**:
   - ✅ Should NOT contain your API key
   - ✅ Should only send image data
   - ✅ API key should only exist in server environment variables

## 🔍 Troubleshooting

### "API key not configured" error

- **Vercel**: Make sure you added the environment variable and redeployed
- **Netlify**: Check environment variables in site settings
- **Local**: Make sure `.env.local` exists and has the correct key

### CORS errors

- Serverless functions handle CORS automatically
- If you see CORS errors, check that the function is deployed correctly

### Function not found (404)

- **Vercel**: Make sure `api/analyze.js` is in your repo
- **Netlify**: Make sure `netlify/functions/analyze.js` exists
- Check the function path in `getApiEndpoint()` matches your platform

## 🚀 Production Checklist

- [ ] API key added as environment variable (not in code)
- [ ] `.env.local` is in `.gitignore` (already done)
- [ ] No API keys in any committed files
- [ ] Tested that API works after deployment
- [ ] Verified API key is not visible in browser DevTools

## 📝 Notes

- **Never commit** `.env.local` or any file with your API key
- The API key is only used server-side in the serverless function
- Each user's browser never sees or stores the API key
- You can rotate your API key anytime by updating the environment variable

## 🔄 Updating Your API Key

1. Go to your hosting platform (Vercel/Netlify)
2. Update the `ANTHROPIC_API_KEY` environment variable
3. Redeploy your application
4. Done! No code changes needed.

