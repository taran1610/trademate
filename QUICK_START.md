# Quick Start Guide - Add Your Supabase Credentials

## 🎯 Where to Add Supabase Credentials

### For Production (Vercel) ✅

1. Go to your **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your **TradeScope AI project**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add these TWO variables:

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co` (your actual URL)
   - Environment: Select **Production**, **Preview**, and **Development** (all three)

   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual anon key)
   - Environment: Select **Production**, **Preview**, and **Development** (all three)

6. Click **Save**
7. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**

### For Local Development 💻

1. In your project folder, create a file named `.env.local`
2. Add these lines:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Replace with your actual values from Supabase
4. Restart your dev server (`npm run dev`)

## 📍 Where to Find Your Supabase Credentials

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** (gear icon) → **API**
4. You'll see:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public** key → This is your `VITE_SUPABASE_ANON_KEY`

## ✅ Quick Checklist

- [ ] Added `VITE_SUPABASE_URL` to Vercel environment variables
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Vercel environment variables
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Redeployed on Vercel
- [ ] Created `.env.local` for local development
- [ ] Ran database schema in Supabase SQL Editor

## 🚀 After Adding Credentials

1. **Redeploy on Vercel** (important!)
2. Test your app - you should see the login screen
3. Create an account and start using it!

## ⚠️ Important Notes

- **Never commit** `.env.local` to git (already in `.gitignore`)
- The `anon` key is safe to use in frontend (it's public)
- Row Level Security (RLS) protects your data
- Each user only sees their own data

## 🆘 Troubleshooting

**"Supabase Not Configured" message:**
- Make sure you added BOTH variables in Vercel
- Make sure you selected all environments
- Make sure you redeployed after adding variables
- Check variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Still not working?**
- Check Vercel deployment logs for errors
- Verify your Supabase project is active
- Make sure you ran the database schema (see SUPABASE_SETUP.md)

