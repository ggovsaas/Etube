# Google OAuth Setup Guide

## Step 1: Verify Google Provider Configuration

The Google provider is already correctly configured in `src/auth.ts`:

```typescript
GoogleProvider({
  clientId: process.env.AUTH_GOOGLE_ID || "",
  clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
})
```

## Step 2: Get Google OAuth Credentials

### 2.1. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### 2.2. Create or Select a Project
1. Click the project dropdown at the top
2. Click "New Project" or select an existing project
3. Give it a name (e.g., "Acompanhantes.life")
4. Click "Create"

### 2.3. Enable Google Identity API
1. Go to **APIs & Services** > **Library**
2. Search for "Google Identity" or "Google+ API"
3. Click on it and click **Enable**

### 2.4. Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Click **Create**
4. Fill in the required information:
   - **App name**: Acompanhantes.life
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. **Scopes**: Click **Add or Remove Scopes**
   - Select: `email`, `profile`, `openid`
   - Click **Update** > **Save and Continue**
7. **Test users** (if in testing mode):
   - Add your email addresses that should be able to test
   - Click **Save and Continue**
8. **Summary**: Review and click **Back to Dashboard**

### 2.5. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. **Application type**: Select **Web application**
4. **Name**: Acompanhantes.life (or your app name)
5. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - `https://your-production-domain.com` (for production)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
7. Click **Create**
8. **Copy the credentials**:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value (click "Show" if needed)

## Step 3: Add to Environment Variables

### Local Development (.env.local)

Add these lines to your `.env.local` file:

```env
# Google OAuth Provider Configuration
AUTH_GOOGLE_ID=your-google-client-id-here.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-client-secret-here
```

**Replace the placeholder values with your actual credentials from Step 2.5**

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables for **Production**:
   - `AUTH_GOOGLE_ID`: Your Google Client ID
   - `AUTH_GOOGLE_SECRET`: Your Google Client Secret

## Step 4: Verify Configuration

After adding the credentials:

1. Restart your development server: `npm run dev`
2. Navigate to your login page
3. You should see a "Sign in with Google" button
4. Click it to test the OAuth flow

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check for trailing slashes or protocol mismatches (http vs https)

### "Access blocked: This app's request is invalid"
- Make sure you've added test users in OAuth consent screen (if in testing mode)
- Wait a few minutes after creating credentials for them to propagate

### "Invalid client"
- Double-check that `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are correctly set
- Make sure there are no extra spaces or quotes in the values

## Security Notes

- **Never commit** `.env.local` to git (it should be in `.gitignore`)
- Keep your Client Secret secure
- Regularly rotate your OAuth credentials
- Use different credentials for development and production







