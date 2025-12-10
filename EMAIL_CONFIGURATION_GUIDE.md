# Email Configuration Guide

## 📧 Where to Configure Emails

All email templates and sending functions are located in:
**`src/lib/email.ts`**

This file contains all email functions:
- ✅ Email Verification (`sendVerificationEmail`)
- ✅ Password Reset (`sendPasswordResetEmail`)
- ✅ Password Changed Confirmation (`sendPasswordChangedEmail`)
- ✅ Welcome Email (`sendWelcomeEmail`)

## 🔧 Environment Variables

Add these to your `.env.local` or `.env` file:

```env
# Mailgun Configuration (REQUIRED)
MAILGUN_API_KEY="your-mailgun-api-key-here"
MAILGUN_DOMAIN="your-domain.com"  # or sandbox domain for testing
MAILGUN_FROM_EMAIL="noreply@your-domain.com"  # Optional, defaults to noreply@MAILGUN_DOMAIN

# Base URL for email links (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"  # or your production URL

# Site Name (Optional - defaults to "EscortTube")
SITE_NAME="EscortTube"
```

## 📝 Available Email Functions

### 1. Email Verification
**Function:** `sendVerificationEmail(email, verificationToken, username?)`
**Location:** `src/lib/email.ts`
**Used in:** `src/app/api/auth/register/route.ts`

**Template Location:** Lines 44-75 in `src/lib/email.ts`
- Edit the HTML content between the template wrapper
- Customize subject line on line 84

### 2. Password Reset
**Function:** `sendPasswordResetEmail(email, resetToken, username?)`
**Location:** `src/lib/email.ts`
**Used in:** (Needs to be implemented in password reset API route)

**Template Location:** Lines 88-130 in `src/lib/email.ts`
- Edit the HTML content between the template wrapper
- Customize subject line on line 131

### 3. Password Changed Confirmation
**Function:** `sendPasswordChangedEmail(email, username?)`
**Location:** `src/lib/email.ts`
**Used in:** (Can be called after password change in `src/app/api/user/change-password/route.ts`)

**Template Location:** Lines 135-170 in `src/lib/email.ts`
- Edit the HTML content between the template wrapper
- Customize subject line on line 171

### 4. Welcome Email
**Function:** `sendWelcomeEmail(email, username?)`
**Location:** `src/lib/email.ts`
**Used in:** (Can be called after email verification in `src/app/api/auth/verify/route.ts`)

**Template Location:** Lines 175-210 in `src/lib/email.ts`
- Edit the HTML content between the template wrapper
- Customize subject line on line 211

## 🎨 Customizing Email Templates

### How to Edit Email Content

1. **Open** `src/lib/email.ts`
2. **Find** the email function you want to customize (e.g., `sendPasswordResetEmail`)
3. **Edit** the HTML content inside the `getEmailTemplate()` function call
4. **Edit** the text content (plain text version) below the HTML
5. **Edit** the subject line in the `sendEmail()` call

### Example: Customizing Password Reset Email

```typescript
// In src/lib/email.ts, find sendPasswordResetEmail function

const htmlContent = getEmailTemplate(`
  <h2 style="color: #111827; margin-top: 0;">Olá${username ? `, ${username}` : ''}!</h2>
  <p style="color: #4b5563; font-size: 16px;">
    <!-- YOUR CUSTOM MESSAGE HERE -->
    Recebemos uma solicitação para redefinir a senha...
  </p>
  <!-- ... rest of template ... -->
`, siteName);
```

### Branding Colors

The email template uses these colors (defined in `getEmailTemplate`):
- **Primary Red:** `#dc2626` (used for buttons and accents)
- **Background:** `#f9fafb` (light gray)
- **Text:** `#111827` (dark gray for headings), `#4b5563` (medium gray for body)
- **Links:** `#dc2626` (red)

To change colors, edit the inline styles in the HTML template.

## 🔗 Email Links Configuration

All email links use `NEXTAUTH_URL` environment variable:
- Verification: `${NEXTAUTH_URL}/api/auth/verify?token=...`
- Password Reset: `${NEXTAUTH_URL}/reset-password?token=...`
- Dashboard: `${NEXTAUTH_URL}/dashboard`

Make sure `NEXTAUTH_URL` matches your production domain in production!

## 📋 NextAuth Email Provider

The NextAuth email provider (magic link login) is configured in:
**`src/auth.ts`** (lines 22-104)

This uses a separate email template for magic link authentication. To customize:
1. Open `src/auth.ts`
2. Find the `sendVerificationRequest` function
3. Edit the HTML content (lines 37-75)

## 🚀 Implementing Password Reset

To implement password reset functionality:

1. **Create API route:** `src/app/api/auth/forgot-password/route.ts`
   ```typescript
   import { sendPasswordResetEmail } from '@/lib/email';
   // Generate reset token, save to database, send email
   ```

2. **Create reset page:** `src/app/reset-password/page.tsx`
   - Form to enter new password
   - Validates token from URL

3. **Create API route:** `src/app/api/auth/reset-password/route.ts`
   - Validates token
   - Updates password
   - Calls `sendPasswordChangedEmail()`

## ✅ Testing Emails

1. **Development:** Emails will log to console if Mailgun is not configured
2. **Mailgun Sandbox:** Use sandbox domain for testing (free tier)
3. **Production:** Use verified domain in Mailgun dashboard

## 📚 Related Files

- **Email Utility:** `src/lib/email.ts`
- **NextAuth Config:** `src/auth.ts`
- **Registration:** `src/app/api/auth/register/route.ts`
- **Verification:** `src/app/api/auth/verify/route.ts`
- **Password Change:** `src/app/api/user/change-password/route.ts`

## 🔒 Security Notes

- Reset tokens should expire (1 hour recommended)
- Tokens should be single-use
- Always validate tokens server-side
- Never expose tokens in error messages
- Use HTTPS in production for all email links


