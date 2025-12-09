# Quick Setup Guide - Easy Steps

Follow these simple steps to set up your app so users can add their own API keys.

## Step 1: Set Up Database (3 minutes)

**Option A: If you haven't set up the database yet (recommended)**

1. **Go to Supabase**: https://supabase.com/dashboard
2. **Click your project**
3. **Click "SQL Editor"** (in the left sidebar)
4. **Click "New Query"**
5. **Copy and paste the ENTIRE contents** of `supabase/schema.sql` file
   - Or use this quick fix script: `supabase/fix-user-preferences.sql`
6. **Click "Run"** (or press Cmd/Ctrl + Enter)
7. **You should see**: "Success" ✅

**Option B: If you already have the database but missing the column**

1. **Go to Supabase SQL Editor**
2. **Copy and paste this**:
   ```sql
   ALTER TABLE user_preferences
   ADD COLUMN IF NOT EXISTS encrypted_api_key TEXT;
   ```
3. **Click "Run"**
4. **If you get "table does not exist" error**, use Option A instead

**Done!** The database is ready.

---

## Step 2: Generate Encryption Secret (1 minute)

1. **Open Terminal** (on your Mac)
2. **Type this command**:
   ```bash
   openssl rand -base64 32
   ```
3. **Press Enter**
4. **Copy the long string** that appears (it looks like: `aBc123XyZ...`)
5. **Save it somewhere safe** - you'll need it in the next step

**Done!** You have your encryption secret.

---

## Step 3: Get Supabase Service Role Key (2 minutes)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Click your project**
3. **Click "Settings"** (gear icon in left sidebar)
4. **Click "API"**
5. **Find "service_role" key** (it's under "Project API keys")
6. **Click the eye icon** to reveal it
7. **Copy the entire key** (it's very long, starts with `eyJ...`)
8. **Save it** - you'll need it in the next step

**⚠️ Important**: This is different from the "anon" key. Make sure you copy the **service_role** key.

**Done!** You have your service role key.

---

## Step 4: Add Variables to Vercel (5 minutes)

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Click your TradeScope AI project**
3. **Click "Settings"** (top menu)
4. **Click "Environment Variables"** (left sidebar)
5. **Add Variable 1**:

   - Click **"Add New"**
   - **Key**: Type `ENCRYPTION_SECRET`
   - **Value**: Paste the secret you generated in Step 2
   - **Environment**: Check all three boxes:
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development
   - Click **"Save"**

6. **Add Variable 2**:
   - Click **"Add New"** again
   - **Key**: Type `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Paste the service role key from Step 3
   - **Environment**: Check all three boxes again:
     - ☑️ Production
     - ☑️ Preview
     - ☑️ Development
   - Click **"Save"**

**Done!** Both variables are added.

---

## Step 5: Remove Old Variable (1 minute)

1. **Still in Vercel Environment Variables**
2. **Look for** `ANTHROPIC_API_KEY` in the list
3. **If you see it**:
   - Click the **three dots (⋯)** next to it
   - Click **"Remove"**
   - Confirm deletion
4. **If you don't see it**: Skip this step - you're good!

**Done!** Old variable removed (if it existed).

---

## Step 6: Redeploy (2 minutes)

**⚠️ IMPORTANT**: You MUST redeploy after adding variables!

1. **Still in Vercel**
2. **Click "Deployments"** (top menu)
3. **Find the latest deployment** (top of the list)
4. **Click the three dots (⋯)** on the right
5. **Click "Redeploy"**
6. **Wait 1-2 minutes** for it to finish
7. **You'll see**: "Ready" with a green checkmark ✅

**Done!** Your app is redeployed with the new settings.

---

## Step 7: Test It! (2 minutes)

1. **Open your app**: Go to your Vercel URL
2. **Sign in** (or create account if needed)
3. **Go to Settings** (click Settings button)
4. **You should see**: "Your API Key (Required)" section
5. **Enter your Anthropic API key**:
   - Get it from: https://console.anthropic.com/
   - Paste it in the input field
   - Click **"Save Key"**
6. **You should see**: "✓ API key saved successfully!"
7. **Try uploading a chart** - it should work! 🎉

**Done!** Everything is working!

---

## ✅ Checklist

- [ ] Database column added (Step 1)
- [ ] Encryption secret generated (Step 2)
- [ ] Service role key copied (Step 3)
- [ ] `ENCRYPTION_SECRET` added to Vercel (Step 4)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Vercel (Step 4)
- [ ] `ANTHROPIC_API_KEY` removed (if it existed) (Step 5)
- [ ] Redeployed (Step 6)
- [ ] Tested: Can save API key in Settings (Step 7)
- [ ] Tested: Can upload chart (Step 7)

---

## 🆘 Having Trouble?

### "ENCRYPTION_SECRET not configured"

- Go back to Step 4
- Make sure you added `ENCRYPTION_SECRET` (exact spelling)
- Make sure you selected all environments
- Redeploy again

### "Supabase admin client not configured"

- Go back to Step 4
- Make sure you added `SUPABASE_SERVICE_ROLE_KEY` (exact spelling)
- Make sure you copied the **service_role** key, not the anon key
- Redeploy again

### "No API key on file" when uploading

- This is normal! User needs to add their key first
- Go to Settings → Add API key → Save
- Try uploading again

### Still not working?

- Check Vercel deployment logs for errors
- Make sure you redeployed after adding variables
- Verify both variables are spelled exactly right

---

## 🎉 That's It!

Once you complete these steps:

- ✅ Users can sign up and sign in
- ✅ Users add their own API keys in Settings
- ✅ Keys are encrypted and secure
- ✅ You pay $0 for user API usage
- ✅ App works for unlimited users!

**Total time**: About 15 minutes

**Need help?** Check [BYOK_SETUP.md](./BYOK_SETUP.md) for more details.
