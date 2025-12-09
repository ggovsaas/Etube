import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// Get admin emails from environment variables (comma-separated)
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  if (!adminEmailsEnv) return [];

  return adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase().trim());
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'ADMIN';
}

/**
 * Verify if the current session user is an admin
 * This should be called in API routes to check admin access
 */
export async function verifyAdminSession(): Promise<{
  isAdmin: boolean;
  session?: any;
  error?: string
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { isAdmin: false, error: 'Authentication required' };
  }

  // Check if user has ADMIN role or email is in admin list
  const hasAdminRole = isAdminRole(session.user.role);
  const hasAdminEmail = isAdminEmail(session.user.email);

  if (hasAdminRole || hasAdminEmail) {
    return { isAdmin: true, session };
  }

  return { isAdmin: false, session, error: 'Admin access required' };
}
