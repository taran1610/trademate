# Email Confirmation Setup

## Why You're Not Getting Confirmation Emails

If users sign up but don't receive confirmation emails, it's likely because:

1. **Email confirmation is enabled** in Supabase (default)
2. **Email provider not configured** properly
3. **Emails going to spam**

## Quick Fix: Disable Email Confirmation (For Testing)

If you want users to sign in immediately without email confirmation:

1. Go to Supabase Dashboard → Your Project
2. Go to **Authentication** → **Providers** → **Email**
3. Scroll down to **Email Confirmation**
4. Toggle **"Enable email confirmations"** to OFF
5. Save

Now users can sign in immediately after signup.

## Proper Setup: Configure Email Provider

For production, you should configure a proper email provider:

### Option 1: Use Supabase's Built-in Email (Free Tier)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email template
3. Emails will be sent from Supabase (may go to spam)

### Option 2: Use Custom SMTP (Recommended for Production)

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your email provider:
   - **SendGrid**
   - **Mailgun**
   - **AWS SES**
   - **Postmark**
   - Or any SMTP server

3. Enter SMTP credentials
4. Test email sending
5. Confirmation emails will now come from your domain

## Email Template Customization

1. Go to **Authentication** → **Email Templates**
2. Click on **"Confirm signup"** template
3. Customize the email content
4. Make sure the confirmation link is included: `{{ .ConfirmationURL }}`
5. Save

## Troubleshooting

### Emails Not Sending
- Check Supabase project is active
- Verify email provider is configured
- Check spam/junk folder
- Look at Supabase logs for email errors

### Users Can't Sign In
- If email confirmation is enabled, users MUST click the link
- Check if link expired (default: 24 hours)
- User can request new confirmation email

### Magic Link Not Working
- Verify email address is correct
- Check spam folder
- Link expires after 1 hour by default
- Request a new link if expired

## Recommended Settings for Production

1. **Enable email confirmations** - Better security
2. **Use custom SMTP** - Professional emails, better deliverability
3. **Customize templates** - Brand your emails
4. **Set appropriate expiration** - 24 hours for confirmation, 1 hour for magic links

## Quick Test

1. Sign up with a test email
2. Check inbox (and spam)
3. Click confirmation link
4. Sign in should work

If emails still don't arrive, check Supabase logs or disable confirmation for testing.


