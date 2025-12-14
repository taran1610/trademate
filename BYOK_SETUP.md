# Bring-Your-Own-Key (BYOK) Setup Guide

## 🔒 Security Model

Your application now uses a **Bring-Your-Own-Key (BYOK)** model where:
- ✅ Each user must provide their own Anthropic API key
- ✅ Keys are encrypted at rest using AES-256-GCM
- ✅ Keys are never exposed to the browser or logged
- ✅ No master API key exists - users pay for their own usage
- ✅ App is locked until user provides their key

## 📋 Setup Steps

### 1. Database Migration

Run the migration to add the `encrypted_api_key` column:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run `supabase/migration-byok.sql`
3. Verify the column was added

### 2. Environment Variables

Add these to **Vercel** or **Netlify**:

#### Required:
- `ENCRYPTION_SECRET` - A strong random string (32+ characters)
  - Generate: `openssl rand -base64 32`
  - **CRITICAL**: Never commit this to git
  - Used to encrypt/decrypt user API keys

- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Dashboard
  - Go to Settings → API → Service Role Key (secret)
  - **NEVER** expose this to frontend
  - Used for server-side database operations

#### Existing (keep these):
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

#### Remove (no longer needed):
- ❌ `ANTHROPIC_API_KEY` - Remove this completely

### 3. Generate Encryption Secret

```bash
# Generate a secure encryption secret
openssl rand -base64 32
```

Copy the output and add it as `ENCRYPTION_SECRET` in your hosting platform.

### 4. Redeploy

After adding environment variables:
1. **Vercel**: Redeploy from Deployments tab
2. **Netlify**: Trigger a new deployment

## 🔐 How It Works

### User Flow:
1. User signs up/logs in
2. User goes to Settings
3. User enters their Anthropic API key
4. Key is sent to `/api/save-key` (encrypted)
5. Server encrypts with AES-256-GCM
6. Encrypted key stored in database
7. User can now use AI features

### Request Flow:
1. User uploads chart
2. Frontend sends request with auth token
3. Server verifies user
4. Server fetches encrypted key from database
5. Server decrypts key at runtime
6. Server uses user's key for Anthropic API call
7. Response returned to user

### Security Features:
- ✅ Keys encrypted with AES-256-GCM
- ✅ Keys decrypted only at request time
- ✅ Never logged or exposed
- ✅ Rate limiting on save/delete endpoints
- ✅ Hard lock if no key exists
- ✅ Automatic redirect to Settings if missing key

## 🚨 Important Security Notes

1. **ENCRYPTION_SECRET**:
   - Must be the same across all deployments
   - If changed, all encrypted keys become invalid
   - Store securely (use password manager)
   - Never commit to git

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - Has admin access to database
   - Bypasses Row Level Security
   - Only used server-side
   - Never expose to frontend

3. **Key Rotation**:
   - Users can update their key anytime in Settings
   - Old encrypted key is overwritten
   - No manual intervention needed

## ✅ Verification Checklist

- [ ] Database migration run successfully
- [ ] `ENCRYPTION_SECRET` added to environment variables
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to environment variables
- [ ] `ANTHROPIC_API_KEY` removed (if it existed)
- [ ] Redeployed after adding variables
- [ ] Tested: User can save API key in Settings
- [ ] Tested: User can delete API key
- [ ] Tested: Chart upload works with user key
- [ ] Tested: Chart upload blocked without key

## 🐛 Troubleshooting

### "ENCRYPTION_SECRET not configured"
- Add `ENCRYPTION_SECRET` to environment variables
- Redeploy

### "Supabase admin client not configured"
- Add `SUPABASE_SERVICE_ROLE_KEY` to environment variables
- Redeploy

### "No API key on file" error
- User needs to add their key in Settings
- This is expected behavior - app is locked until key is provided

### "Failed to decrypt API key"
- Encryption secret may have changed
- User needs to re-enter their key in Settings

## 📊 Benefits

- ✅ **No cost to you** - Users pay for their own API usage
- ✅ **Scalable** - Unlimited users, no per-user cost
- ✅ **Secure** - Enterprise-grade encryption
- ✅ **Compliant** - Meets security best practices
- ✅ **Monetizable** - Can charge for app access, not API usage


