import { verify } from 'jsonwebtoken';

// Get admin emails from environment variables (comma-separated)
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  if (!adminEmailsEnv) return [];
  
  return adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

export function isAdmin(decoded: any): boolean {
  if (!decoded) return false;
  
  // Check if user role is ADMIN
  if (decoded.role === 'ADMIN') {
    return true;
  }
  
  // Check if user email is in admin list from environment variables
  const email = decoded.email ? decoded.email.toLowerCase().trim() : null;
  if (email) {
    const adminEmails = getAdminEmails();
    return adminEmails.includes(email);
  }
  
  return false;
}

export function verifyAdmin(token: string | undefined): { isAdmin: boolean; decoded?: any; error?: string } {
  if (!token) {
    return { isAdmin: false, error: 'Authentication required' };
  }

  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    
    if (isAdmin(decoded)) {
      return { isAdmin: true, decoded };
    }
    
    return { isAdmin: false, decoded, error: 'Admin access required' };
  } catch (error) {
    return { isAdmin: false, error: 'Invalid token' };
  }
}

