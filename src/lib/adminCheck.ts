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
 * Check if user is a Master Admin (email in ADMIN_EMAILS env var)
 */
export function isMasterAdmin(email: string | null | undefined): boolean {
  return isAdminEmail(email);
}

/**
 * Check if user is a Standard Admin (has ADMIN role but not Master Admin email)
 */
export function isStandardAdmin(email: string | null | undefined, role: string | null | undefined): boolean {
  if (!email || !role) return false;
  return isAdminRole(role) && !isMasterAdmin(email);
}

/**
 * Verify if the current session user is an admin (Master or Standard)
 * This should be called in API routes to check admin access
 */
export async function verifyAdminSession(): Promise<{
  isAdmin: boolean;
  isMasterAdmin: boolean;
  session?: any;
  error?: string
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { isAdmin: false, isMasterAdmin: false, error: 'Authentication required' };
  }

  const email = session.user.email;
  const role = session.user.role;

  // Check if user is Master Admin
  const masterAdmin = isMasterAdmin(email);
  
  // Check if user is Standard Admin
  const standardAdmin = isStandardAdmin(email, role);

  if (masterAdmin || standardAdmin) {
    return { 
      isAdmin: true, 
      isMasterAdmin: masterAdmin,
      session 
    };
  }

  return { 
    isAdmin: false, 
    isMasterAdmin: false,
    session, 
    error: 'Admin access required' 
  };
}

/**
 * Permission checks for Standard Admin access
 * Master Admin has access to everything
 */
export interface AdminPermissions {
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageAdmins: boolean;
  canManageSettings: boolean;
  canManageIntegrations: boolean;
  canManageMaintenance: boolean;
  canManagePricing: boolean;
  canManagePaymentGateways: boolean;
  canManageSecuritySettings: boolean;
  canManageBackups: boolean;
  canViewAuditLogs: boolean;
  canEditAuditLogs: boolean;
  canViewSystemMonitoring: boolean;
  canViewReports: boolean; // Reports & Data Exports
}

/**
 * Get permissions for the current admin user
 */
export async function getAdminPermissions(): Promise<AdminPermissions> {
  const { isAdmin, isMasterAdmin, session } = await verifyAdminSession();

  if (!isAdmin) {
    // Return all false if not admin
    return {
      canManageUsers: false,
      canManageRoles: false,
      canManageAdmins: false,
      canManageSettings: false,
      canManageIntegrations: false,
      canManageMaintenance: false,
      canManagePricing: false,
      canManagePaymentGateways: false,
      canManageSecuritySettings: false,
      canManageBackups: false,
      canViewAuditLogs: false,
      canEditAuditLogs: false,
      canViewSystemMonitoring: false,
      canViewReports: false,
    };
  }

  // Master Admin has all permissions
  if (isMasterAdmin) {
    return {
      canManageUsers: true,
      canManageRoles: true,
      canManageAdmins: true,
      canManageSettings: true,
      canManageIntegrations: true,
      canManageMaintenance: true,
      canManagePricing: true,
      canManagePaymentGateways: true,
      canManageSecuritySettings: true,
      canManageBackups: true,
      canViewAuditLogs: true,
      canEditAuditLogs: true,
      canViewSystemMonitoring: true,
      canViewReports: true,
    };
  }

  // Standard Admin permissions (based on the requirements)
  return {
    canManageUsers: true, // Full access to user accounts
    canManageRoles: false, // NO access to RBAC
    canManageAdmins: false, // NO access to admin team management
    canManageSettings: true, // Limited access (non-critical settings only)
    canManageIntegrations: false, // NO access to integrations & APIs
    canManageMaintenance: false, // NO access to maintenance & deployment
    canManagePricing: false, // NO access to pricing plans
    canManagePaymentGateways: false, // NO access to payment gateways
    canManageSecuritySettings: false, // NO access to security settings
    canManageBackups: false, // NO access to data backup & restore
    canViewAuditLogs: true, // Read-only access
    canEditAuditLogs: false, // Cannot modify logs
    canViewSystemMonitoring: false, // NO access to real-time system monitoring
    canViewReports: true, // Full access to Reports & Data Exports
  };
}
