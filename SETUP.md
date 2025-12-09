# Setup Guide - BYOK (Bring Your Own Key) Configuration

This guide shows you how to configure the Bring-Your-Own-Key system where each user provides their own API key.

## 🔒 Security Overview

- ✅ Each user must provide their own Anthropic API key
- ✅ Keys are encrypted at rest using AES-256-GCM
- ✅ Keys are never exposed to the browser or logged
- ✅ No master API key exists
- ✅ Users pay for their own API usage

## 📋 Setup Steps

### Step 1: Database Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the migration script from `supabase/migration-byok.sql`
3. This adds the `encrypted_api_key` column to `user_preferences` table

### Step 2: Generate Encryption Secret

Generate a strong encryption secret:

```bash
openssl rand -base64 32
```

Copy the output - you'll need it in the next step.

### Step 3: Add Environment Variables

#### For Vercel:

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

   **Variable 1:**
   - **Name**: `ENCRYPTION_SECRET`
   - **Value**: The secret you generated (from Step 2)
   - **Environment**: Production, Preview, Development (select all)

   **Variable 2:**
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Your Supabase service role key (from Supabase Dashboard → Settings → API)
   - **Environment**: Production, Preview, Development (select all)

4. Click **Save**

#### For Netlify:

1. Go to **Site settings** → **Environment variables**
2. Add the same two variables as above
3. Click **Save**

#### For Local Development:

Create `.env.local`:
```bash
ENCRYPTION_SECRET=your-generated-secret-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Get Supabase Service Role Key

1. Go to Supabase Dashboard → Your Project
2. Go to **Settings** → **API**
3. Find **service_role** key (secret) - this is different from the anon key
4. Copy it - you'll use this as `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ WARNING:** Never expose the service role key to the frontend. It has admin access.

### Step 5: Redeploy

**CRITICAL:** You must redeploy after adding environment variables!

1. **Vercel**: Go to Deployments → Click three dots → Redeploy
2. **Netlify**: Trigger a new deployment
3. Wait for deployment to complete

### Step 6: Test

1. Sign in to your app
2. Go to **Settings**
3. Enter your Anthropic API key
4. Click **Save Key**
5. Try uploading a chart - it should work!

## 🔐 How It Works

1. **User adds key**: User enters their API key in Settings
2. **Encryption**: Key is encrypted with AES-256-GCM using `ENCRYPTION_SECRET`
3. **Storage**: Encrypted key is stored in Supabase database
4. **Usage**: When user uploads chart:
   - Server fetches encrypted key
   - Decrypts at runtime
   - Uses user's key for Anthropic API call
   - Key is never logged or exposed

## ✅ Verification

- [ ] Database migration completed
- [ ] `ENCRYPTION_SECRET` added to environment variables
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to environment variables
- [ ] Redeployed after adding variables
- [ ] User can save API key in Settings
- [ ] Chart upload works with user's key
- [ ] Chart upload blocked without key

## 🚨 Important Notes

1. **ENCRYPTION_SECRET**:
   - Must be the same across all deployments
   - If changed, all encrypted keys become invalid
   - Store securely (password manager)
   - Never commit to git

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - Has admin database access
   - Only used server-side
   - Never expose to frontend

3. **No Master Key**:
   - ❌ Remove `ANTHROPIC_API_KEY` if it exists
   - ✅ Each user provides their own key
   - ✅ You pay nothing for user API usage

## 📚 See Also

- [BYOK_SETUP.md](./BYOK_SETUP.md) - Complete BYOK documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and fixes
