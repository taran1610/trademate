# Supabase Setup Guide

Follow these steps to connect your Supabase project to TradeScope AI.

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project (e.g., "taran1610's Project")
3. Go to **Settings** → **API** (in the left sidebar)
4. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

Copy both of these values.

## Step 2: Set Up Environment Variables

### For Local Development

1. Create a `.env.local` file in the project root:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Replace with your actual values from Step 1.

### For Production (Vercel/Netlify)

1. **Vercel:**
   - Go to your project → Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = your project URL
     - `VITE_SUPABASE_ANON_KEY` = your anon key
   - Redeploy

2. **Netlify:**
   - Go to Site Settings → Environment Variables
   - Add the same variables
   - Redeploy

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

This creates:
- `sessions` table for storing trading sessions
- `user_preferences` table for user settings
- Row Level Security (RLS) policies so users only see their own data
- Indexes for better performance

## Step 4: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email** provider should be enabled by default
3. (Optional) Enable other providers like Google, GitHub, etc.

### Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and magic link emails if desired

## Step 5: Test It Out

1. Start your dev server:
   ```bash
   npm install
   npm run dev
   ```

2. You should see the login/signup screen
3. Create an account with your email
4. Check your email for the confirmation link (if email confirmation is enabled)
5. Sign in and start using the app!

## Features You Get

✅ **User Authentication**
- Sign up with email/password
- Sign in with email/password
- Magic link (passwordless) login
- Secure session management

✅ **Database Storage**
- All sessions stored in Supabase
- Syncs across all your devices
- Automatic backups
- Row-level security (users only see their data)

✅ **Fallback Support**
- If Supabase isn't configured, app uses localStorage
- Seamless transition between storage methods

## Troubleshooting

### "Supabase Not Configured" message
- Make sure `.env.local` exists with correct variables
- Restart your dev server after adding env variables
- Check that variable names start with `VITE_`

### "Invalid API key" error
- Double-check your anon key is correct
- Make sure there are no extra spaces
- Try regenerating the key in Supabase dashboard

### Database errors
- Make sure you ran the schema.sql file
- Check that RLS policies are enabled
- Verify tables exist in Database → Tables

### Auth not working
- Check Authentication → Providers → Email is enabled
- Verify email confirmation settings
- Check browser console for errors

## Security Notes

- The `anon` key is safe to use in the frontend (it's public)
- Row Level Security (RLS) ensures users can only access their own data
- Never commit `.env.local` to git (already in `.gitignore`)
- API keys for Anthropic are still stored server-side (secure)

## Next Steps

Once set up:
1. Share the app with your friends!
2. They can create their own accounts
3. Each user's data is completely private
4. All data syncs automatically

Enjoy! 🚀

