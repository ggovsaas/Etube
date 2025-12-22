# Admin Setup Guide

## Environment Variables

To set up admin access, you need to configure the `ADMIN_EMAILS` environment variable.

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the root of your project (same directory as `package.json`).

### Step 2: Add Admin Emails

Add the following line to `.env.local`:

```env
ADMIN_EMAILS="your-admin-email@example.com,another-admin@example.com"
```

**Important:**
- Use comma-separated list for multiple admin emails
- Emails are case-insensitive
- Users with these emails will automatically get ADMIN role when they log in
- **Never commit `.env.local` to git** - it should be in `.gitignore`

### Step 3: Restart the Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## How It Works

1. When a user logs in or registers, the system checks if their email is in the `ADMIN_EMAILS` list
2. If the email matches, the user automatically receives the `ADMIN` role in their JWT token
3. The JWT token is stored as an HTTP-only cookie and persists for 7 days
4. All admin routes check this token to verify admin access

## Security Notes

- Admin emails are stored in environment variables, not in code
- The `.env.local` file should never be committed to version control
- JWT tokens are signed with `NEXTAUTH_SECRET` and expire after 7 days
- Admin access is verified on every request to admin routes

## Troubleshooting

If you're having issues accessing the admin dashboard:

1. **Check your `.env.local` file exists** and contains `ADMIN_EMAILS`
2. **Verify your email is in the list** (case-insensitive)
3. **Log out and log back in** to get a new token with admin role
4. **Check browser console** for any authentication errors
5. **Verify `NEXTAUTH_SECRET` is set** in your environment variables






