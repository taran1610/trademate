# Troubleshooting Guide

## ✅ Deployment Successful - But Supabase Not Working?

If you added the Supabase keys to Vercel but the app still shows "Supabase Not Configured":

### Step 1: Verify Environment Variables

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Check that you have BOTH:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Make sure they're spelled exactly (case-sensitive!)
4. Make sure you selected **all environments** (Production, Preview, Development)

### Step 2: Redeploy (CRITICAL!)

**You MUST redeploy after adding environment variables!**

1. Go to **Deployments** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **Redeploy**
4. Wait for it to finish (about 1-2 minutes)

### Step 3: Verify Keys Are Correct

1. Go to Supabase Dashboard → Your Project → **Settings** → **API**
2. Copy your **Project URL** and **anon key** again
3. Double-check they match what you pasted in Vercel
4. Make sure there are no extra spaces or quotes

### Step 4: Check Deployment Logs

1. In Vercel, go to **Deployments** → Click on your latest deployment
2. Check the **Build Logs** for any errors
3. Look for messages about environment variables

### Step 5: Test the App

1. Open your deployed app (use your Vercel deployment URL, e.g., `https://your-project.vercel.app`)
2. Check browser console (F12 → Console tab)
3. Look for any Supabase-related errors

## Common Issues

### Issue: "API key not configured" error when uploading charts

**Error Message:** "Error analyzing chart: API key not configured. Please set ANTHROPIC_API_KEY environment variable."

**Cause:** Anthropic API key not set in Vercel environment variables

**Fix:**

1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key from Anthropic
   - **Environment**: Select all (Production, Preview, Development)
4. **Redeploy** (critical - environment variables only apply to new deployments)
5. Test uploading a chart again

### Issue: "Supabase Not Configured" message

**Cause:** Environment variables not set or not redeployed

**Fix:**

1. Add variables in Vercel Settings → Environment Variables
2. **Redeploy** (this is the most common mistake!)
3. Wait for deployment to complete
4. Refresh your app

### Issue: "Invalid API key" error

**Cause:** Wrong key or extra characters

**Fix:**

1. Copy the key again from Supabase
2. Make sure there are no spaces before/after
3. Don't add quotes around the value
4. Update in Vercel and redeploy

### Issue: App works but no login screen

**Cause:** Supabase not configured, using localStorage fallback

**Fix:**

1. Check environment variables are set
2. Redeploy
3. Check browser console for errors

### Issue: Can't sign up/login

**Cause:** Database schema not set up

**Fix:**

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the schema from `supabase/schema.sql`
3. Verify tables exist in **Database** → **Tables**

## Quick Checklist

- [ ] Added `VITE_SUPABASE_URL` to Vercel
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Vercel
- [ ] Selected all environments (Production, Preview, Development)
- [ ] **Redeployed after adding variables** ← Most important!
- [ ] Ran database schema in Supabase SQL Editor
- [ ] Tested the app - see login screen?

## Still Not Working?

1. **Check Vercel Logs:**

   - Deployments → Latest → Build Logs
   - Look for any red errors

2. **Check Browser Console:**

   - Open app → F12 → Console
   - Look for Supabase errors

3. **Verify Supabase Project:**

   - Make sure project is active
   - Check API settings are correct
   - Verify database tables exist

4. **Test Locally:**
   - Create `.env.local` with your keys
   - Run `npm run dev`
   - If it works locally but not on Vercel, it's an env variable issue
