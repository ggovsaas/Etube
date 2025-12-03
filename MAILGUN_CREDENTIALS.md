# Mailgun Credentials

## API Credentials

**API Key:**
```
[YOUR_MAILGUN_API_KEY]
```

**HTTP Webhook Signing Key:**
```
[YOUR_WEBHOOK_SIGNING_KEY]
```

**Verification Public Key:**
```
[YOUR_VERIFICATION_PUBLIC_KEY]
```

**Note:** Replace the placeholders above with your actual Mailgun credentials from your Mailgun dashboard.

## Environment Variables Setup

Add these to your `.env.local` file:

```env
# Mailgun API Key
MAILGUN_API_KEY="your-mailgun-api-key-here"

# Mailgun Domain (REQUIRED - replace with your actual domain)
# You can find this in your Mailgun dashboard under Sending → Domains
# For testing, you can use the sandbox domain (e.g., sandbox123456.mailgun.org)
MAILGUN_DOMAIN="your-domain.com"

# From Email (Optional - defaults to noreply@MAILGUN_DOMAIN)
MAILGUN_FROM_EMAIL="noreply@your-domain.com"

# Webhook Signing Key (Optional - for webhook verification)
MAILGUN_WEBHOOK_SIGNING_KEY="your-webhook-signing-key-here"
```

## Finding Your Mailgun Domain

1. Log in to your Mailgun dashboard
2. Go to **Sending** → **Domains**
3. You'll see your verified domains listed
4. For testing, you can use the **sandbox domain** (format: `sandboxXXXXXX.mailgun.org`)
5. Copy the domain name and use it as `MAILGUN_DOMAIN`

## Important Notes

- ⚠️ **Never commit this file or `.env.local` to git**
- The domain must be verified in Mailgun before sending emails
- Sandbox domains can only send to authorized recipients (add them in Mailgun dashboard)
- For production, use a verified custom domain

