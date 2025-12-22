# Email Verification Setup Guide

## Overview

Email verification has been implemented using Mailgun. When users register, they will automatically receive a verification email with a link to verify their account.

## What Was Implemented

1. ✅ **Database Schema Updates**: Added `emailVerified`, `verificationToken`, and `verificationExpiry` fields to the User model
2. ✅ **Mailgun Integration**: Installed and configured `mailgun.js` package
3. ✅ **Email Utility**: Created email sending function with HTML email template
4. ✅ **Registration Flow**: Updated registration to save verification token and send email
5. ✅ **Verification Endpoint**: Created `/api/auth/verify` endpoint to handle email verification
6. ✅ **Success/Failed Pages**: Created user-friendly pages for verification results

## Required Environment Variables

Add these to your `.env.local` or `.env` file:

```env
# Mailgun API Key (REQUIRED)
MAILGUN_API_KEY="your-mailgun-api-key-here"

# Mailgun Domain (REQUIRED) - Your verified domain in Mailgun
MAILGUN_DOMAIN="your-domain.com"

# From Email Address (OPTIONAL - defaults to noreply@MAILGUN_DOMAIN)
MAILGUN_FROM_EMAIL="noreply@your-domain.com"

# Base URL for verification links (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"  # or your production URL

# Optional: Mailgun Webhook Signing Key (for webhook verification)
MAILGUN_WEBHOOK_SIGNING_KEY="your-webhook-signing-key-here"
```

## Setup Steps

### 1. Update Database Schema

After adding the verification fields to the Prisma schema, you need to sync your database:

```bash
cd datingdirectory
npx prisma generate
npx prisma db push
```

### 2. Set Environment Variables

Create or update your `.env.local` file with the Mailgun credentials:

```env
MAILGUN_API_KEY="your-mailgun-api-key-here"
MAILGUN_DOMAIN="your-domain.com"
MAILGUN_FROM_EMAIL="noreply@your-domain.com"
NEXTAUTH_URL="http://localhost:3000"
```

**Important:** 
- Never commit `.env.local` to git
- In production, set these as environment variables in your hosting platform
- Replace `your-domain.com` with your actual verified Mailgun domain

### 3. Verify Mailgun Domain

In your Mailgun account:
1. Go to Sending → Domains
2. Add and verify your domain (or use the sandbox domain for testing)
3. Complete DNS verification if using a custom domain
4. The email will be sent from the address specified in `MAILGUN_FROM_EMAIL` or `noreply@MAILGUN_DOMAIN`
5. For testing, you can use the Mailgun sandbox domain (e.g., `sandbox123456.mailgun.org`)

### 4. Test Email Verification

1. Start your development server: `npm run dev`
2. Register a new user account
3. Check the email inbox for the verification email
4. Click the verification link
5. You should be redirected to the success page

## How It Works

1. **Registration**: When a user registers:
   - A verification token is generated
   - Token expiry is set to 24 hours
   - User record is saved with `emailVerified: false`
   - Verification email is sent via Mailgun

2. **Email Verification**: When user clicks the link:
   - Token is validated (must exist and not be expired)
   - User's `emailVerified` is set to `true`
   - Verification token is cleared
   - User is redirected to success page

3. **Error Handling**: If verification fails:
   - Invalid/expired token → Redirect to failure page
   - Missing token → Redirect to failure page
   - Server error → Redirect to failure page with error message

## Email Template

The verification email includes:
- Professional HTML design with your branding
- Clear call-to-action button
- Fallback text link
- Portuguese language (matches your site)
- 24-hour expiry notice

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `MAILGUN_API_KEY` is set correctly
2. **Check Domain**: Verify `MAILGUN_DOMAIN` is set and matches your Mailgun domain
3. **Check Console**: Look for error messages in server logs
4. **Mailgun Dashboard**: Check Mailgun logs for delivery status and errors
5. **Domain Verification**: Ensure domain is verified in Mailgun (or use sandbox for testing)
6. **From Email**: Ensure `MAILGUN_FROM_EMAIL` uses a verified sender address

### Verification Link Not Working

1. **Check NEXTAUTH_URL**: Must match your actual domain
2. **Check Token Expiry**: Links expire after 24 hours
3. **Check Database**: Verify token was saved correctly

### Database Errors

If you see errors about missing fields:
```bash
npx prisma generate
npx prisma db push
```

## Notes

- **Twilio credentials are NOT needed** for email verification (Twilio is for SMS/voice)
- **Mailgun API key and domain are required** for email functionality
- For testing, you can use Mailgun's sandbox domain (found in your Mailgun dashboard)
- Verification emails are sent asynchronously (registration won't fail if email fails)
- Users can still log in before verifying, but you can add checks to require verification for certain features
- Mailgun provides webhook signing key for verifying webhook requests (optional but recommended)

## Next Steps (Optional Enhancements)

1. Add "Resend Verification Email" functionality
2. Add email verification requirement for certain features
3. Add email templates for other notifications (password reset, etc.)
4. Add email verification status to user dashboard

