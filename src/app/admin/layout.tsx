'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use NextAuth signIn for proper session management
      const { signIn } = await import('next-auth/react');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error || 'Login failed');
      }

      if (result?.ok) {
        // Session is now set, use router.push instead of window.location to preserve session
        router.push('/admin');
        router.refresh(); // Refresh to update UI with new session
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the admin dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Admin email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [permissions, setPermissions] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const adminEmails = ['jwfcarvalho1989@gmail.com', 'ggovsaas@gmail.com'];

    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (status === 'unauthenticated') {
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    if (status === 'authenticated') {
      const userEmail = session?.user?.email?.toLowerCase();
      const isEmailAdmin = userEmail && adminEmails.includes(userEmail);
      const hasAdminRole = session?.user?.role === 'ADMIN';

      // Check admin by email or role only - no API calls to prevent session issues
      setIsAdmin(hasAdminRole || isEmailAdmin);
      setIsMasterAdmin(isEmailAdmin || false);
      
      // Fetch permissions
      if (hasAdminRole || isEmailAdmin) {
        fetch('/api/admin/permissions')
          .then(res => res.json())
          .then(data => setPermissions(data))
          .catch(err => console.error('Error fetching permissions:', err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [status, session?.user?.email, session?.user?.role])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Show admin login form if not authenticated or not admin
  if (status === 'unauthenticated' || (status === 'authenticated' && !isAdmin && !loading)) {
    return <AdminLoginForm />;
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Only show dashboard if authenticated and admin
  if (status !== 'authenticated' || !isAdmin) {
    return <AdminLoginForm />;
  }

  // Filter sidebar items based on permissions
  const getFilteredSidebarItems = () => {
    if (!permissions) return [];
    
    const allItems = [
      {
        href: '/admin',
        label: 'Dashboard',
        requiresPermission: null, // Always visible
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
          </svg>
        ),
      },
      {
        href: '/admin/users',
        label: 'Users',
        requiresPermission: 'canManageUsers',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.549 1.718-3.28-.07-.767-.27-1.505-.57-2.197C5.6 6.5 4.5 6.5 3.5 6.5c-1.5 0-2.5.5-2.5 1.5S2 10 3.5 10c.5 0 1-.1 1.5-.3.1.4.3.8.5 1.1.2.3.4.5.7.7z" />
          </svg>
        ),
      },
      {
        href: '/admin/profiles',
        label: 'Profiles',
        requiresPermission: 'canManageUsers', // Profiles are part of user management
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
          </svg>
        ),
      },
      {
        href: '/admin/listings',
        label: 'Listings',
        requiresPermission: null, // All admins can manage listings
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        href: '/admin/media',
        label: 'Media',
        requiresPermission: null, // All admins can manage media
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 0v4h4V4H6zm8 0a2 2 0 0 1 2-2h.5a.5.5 0 0 1 0 1H16v2.5a.5.5 0 0 1-1 0V4zm0 8a2 2 0 0 1-2 2h-.5a.5.5 0 0 1 0-1H14v-2.5a.5.5 0 0 1 1 0V12zM6 12a2 2 0 0 1-2 2H3.5a.5.5 0 0 1 0-1H4v-2.5a.5.5 0 0 1 1 0V12zm2 0v4h4v-4H8z" />
          </svg>
        ),
      },
      {
        href: '/admin/reviews',
        label: 'Reviews',
        requiresPermission: null, // All admins can manage reviews
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
          </svg>
        ),
      },
      {
        href: '/admin/verifications',
        label: 'Verifications',
        requiresPermission: null, // All admins can approve verifications
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8z" />
          </svg>
        ),
      },
      {
        href: '/admin/contests',
        label: 'Contests',
        requiresPermission: null, // All admins can manage contests
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c.04.3.06.6.06.9v7.5c0 .3-.02.6-.06.9a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5c-.04-.3-.06-.6-.06-.9V1.4c0-.3.02-.6.06-.9zM3 1a.5.5 0 0 0-.5.5v7.5A.5.5 0 0 0 3 9h10a.5.5 0 0 0 .5-.5V1.5A.5.5 0 0 0 13 1H3zm0 10a.5.5 0 0 1 .5.5h9a.5.5 0 0 1 0-1h-9a.5.5 0 0 1-.5.5zm0 2a.5.5 0 0 1 .5.5h9a.5.5 0 0 1 0-1h-9a.5.5 0 0 1-.5.5z" />
          </svg>
        ),
      },
      {
        href: '/admin/roles',
        label: 'Roles & Permissions',
        requiresPermission: 'canManageRoles',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5.5 7.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm.5-6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
          </svg>
        ),
      },
      {
        href: '/admin/audit-logs',
        label: 'Audit Logs',
        requiresPermission: 'canViewAuditLogs',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
        ),
      },
      {
        href: '/admin/reports',
        label: 'Reports',
        requiresPermission: null, // All admins can view reports
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.5 0a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h.5v-.5a.5.5 0 0 1 .5-.5h.5v-.5a.5.5 0 0 1 .5-.5h.5v-.5a.5.5 0 0 1 .5-.5h5zM3 1v1h1V1H3zm2 0v1h1V1H5zm2 0v1h1V1H7zm3 0v1h1V1h-1zM3 2v1h1V2H3zm2 0v1h1V2H5zm2 0v1h1V2H7zm3 0v1h1V2h-1zM3 3v1h1V3H3zm2 0v1h1V3H5zm2 0v1h1V3H7zm3 0v1h1V3h-1zM3 4v1h1V4H3zm2 0v1h1V4H5zm2 0v1h1V4H7zm3 0v1h1V4h-1zM3 5v1h1V5H3zm2 0v1h1V5H5zm2 0v1h1V5H7zm3 0v1h1V5h-1zM3 6v1h1V6H3zm2 0v1h1V6H5zm2 0v1h1V6H7zm3 0v1h1V6h-1zM3 7v1h1V7H3zm2 0v1h1V7H5zm2 0v1h1V7H7zm3 0v1h1V7h-1z" />
          </svg>
        ),
      },
      {
        href: '/admin/settings',
        label: 'Settings',
        requiresPermission: 'canManageSettings',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
          </svg>
        ),
      },
    ];

    return allItems.filter(item => {
      if (item.requiresPermission === null) return true;
      return permissions[item.requiresPermission] === true;
    });
  };

  const adminSidebarItems = getFilteredSidebarItems();

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.name || '',
    role: session.user.role || 'USER',
  } : null;

  return (
    <DashboardLayout user={user} isAdmin={true} sidebarItems={adminSidebarItems}>
      {children}
    </DashboardLayout>
  );
} 