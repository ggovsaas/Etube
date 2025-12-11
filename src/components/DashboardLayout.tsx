'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import { useSession } from 'next-auth/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isClient?: boolean;
    isContentCreator?: boolean;
    isServiceProvider?: boolean;
    profile?: {
      id: string;
      name: string;
    };
  };
  isAdmin?: boolean;
  sidebarItems?: Array<{
    href: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
  }>;
}

export default function DashboardLayout({
  children,
  user,
  isAdmin = false,
  sidebarItems = [],
}: DashboardLayoutProps) {
  const { locale, getLocalizedPath } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);

  const { data: session } = useSession();

  const handleLogout = async () => {
    // If logging out from user dashboard, check if user is also an admin
    // If so, warn them that it will log them out of admin too
    if (!isAdmin && (user || session?.user)) {
      const adminEmails = ['jwfcarvalho1989@gmail.com', 'ggovsaas@gmail.com'];
      const userEmail = (user?.email || session?.user?.email)?.toLowerCase();
      const userRole = user?.role || session?.user?.role;
      const isUserAdmin = userEmail && (adminEmails.includes(userEmail) || userRole === 'ADMIN');
      
      if (isUserAdmin) {
        const confirmLogout = window.confirm(
          locale === 'pt' 
            ? 'Você está logado como administrador. Fazer logout aqui também irá desconectá-lo do painel de administração. Deseja continuar?'
            : 'Estás conectado como administrador. Cerrar sesión aquí también te desconectará del panel de administración. ¿Deseas continuar?'
        );
        if (!confirmLogout) {
          return; // User cancelled logout
        }
      }
    }

    try {
      const { signOut } = await import('next-auth/react');
      const callbackUrl = isAdmin ? '/login' : getLocalizedPath('/');
      await signOut({ 
        callbackUrl,
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      if (isAdmin) {
        router.push('/login');
      } else {
        router.push(getLocalizedPath('/'));
      }
    }
  };

  // No redirect needed - all authenticated users should have dashboard access
  // Removed setCheckingAccess - no longer needed

  // Dynamic sidebar items based on user roles
  const getDynamicSidebarItems = () => {
    const isContentCreator = user?.isContentCreator || false;
    const isServiceProvider = user?.isServiceProvider || false;
    const isClient = user?.isClient !== false; // Default to true

    // Client-only users get a restricted consumer sidebar
    if (!isContentCreator && !isServiceProvider && isClient) {
      return [
        {
          href: `/${locale}/dashboard/home`,
          label: locale === 'es' ? 'Dashboard' : 'Dashboard',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/minha-conta`,
          label: locale === 'es' ? 'Mi Cuenta' : 'Minha Conta',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/settings`,
          label: locale === 'es' ? 'Configuración' : 'Configurações',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/carteira`,
          label: locale === 'es' ? 'Cartera / Comprar Créditos' : 'Carteira / Comprar Créditos',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/faturas`,
          label: locale === 'es' ? 'Facturas / Histórico de Compras' : 'Faturas / Histórico de Compras',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/blogs`,
          label: locale === 'es' ? 'Artículos & Stories' : 'Artigos & Stories',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        },
      ];
    }

    // Build unified Creator/Service Management sidebar for creators/providers
    const sidebarItems = [
      // Dashboard - All creators/providers see this
      {
        href: `/${locale}/dashboard/home`,
        label: locale === 'es' ? 'Dashboard' : 'Dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      
      // Service Provider only items
      ...(isServiceProvider ? [
        {
          href: `/${locale}/criar-anuncio`,
          label: locale === 'es' ? 'Crear Anuncio' : 'Criar Anúncio',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/meus-anuncios`,
          label: locale === 'es' ? 'Mis Anuncios' : 'Meus Anúncios',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/media`,
          label: locale === 'es' ? 'Media' : 'Media',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/${locale === 'es' ? 'rifas' : 'rifas'}`,
          label: locale === 'es' ? 'Rifas' : 'Rifas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/tv-tube`,
          label: locale === 'es' ? 'TV/Tube' : 'TV/Tube',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/webcam`,
          label: locale === 'es' ? 'Webcam Studio' : 'Webcam Studio',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
        },
      ] : []),
      
      // Content Creator only items (NOT service providers, as they already have these above)
      ...(isContentCreator && !isServiceProvider ? [
        {
          href: `/${locale}/dashboard/media`,
          label: locale === 'es' ? 'Media' : 'Media',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/${locale === 'es' ? 'rifas' : 'rifas'}`,
          label: locale === 'es' ? 'Rifas' : 'Rifas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
        },
        {
          href: `/${locale}/dashboard/tv-tube`,
          label: locale === 'es' ? 'TV/Tube' : 'TV/Tube',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
        },
      ] : []),
      
      // ALL users - Blogs (available to everyone)
      {
        href: `/${locale}/dashboard/blogs`,
        label: locale === 'es' ? 'Artículos & Stories' : 'Artigos & Stories',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
      },
      
      // Common items for all creators/providers
      {
        href: `/${locale}/dashboard/verificar-fotos`,
        label: locale === 'es' ? 'Verificar Fotos' : 'Verificar Fotos',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        href: `/${locale}/dashboard/faturas`,
        label: locale === 'es' ? 'Facturas' : 'Faturas',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      // Earnings & Payouts - Only for service providers and creators
      ...((isServiceProvider || isContentCreator) ? [
        {
          href: `/${locale}/dashboard/earnings`,
          label: locale === 'es' ? 'Ganancias' : 'Ganhos',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ] : []),
        {
          href: `/${locale}/dashboard/minha-conta`,
          label: locale === 'es' ? 'Mi Cuenta' : 'Minha Conta',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        href: `/${locale}/dashboard/settings`,
        label: locale === 'es' ? 'Configuración' : 'Configurações',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        href: `/${locale}/dashboard/premium`,
        label: locale === 'es' ? 'Premium' : 'Premium',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        ),
      },
    ];

    return sidebarItems;
  };

  // Default user sidebar items (fallback if no user data)
  const defaultUserSidebarItems = getDynamicSidebarItems();

  // Use dynamic sidebar if user data is available, otherwise use provided sidebarItems or default
  const items = sidebarItems.length > 0 
    ? sidebarItems 
    : (user ? getDynamicSidebarItems() : defaultUserSidebarItems);

  // Check if item is active
  const isActive = (href: string) => {
    if (href === `/${locale}/dashboard/home`) {
      return pathname === `/${locale}/dashboard/home` || pathname === `/${locale}/dashboard`;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white shadow-lg w-64 transition-transform duration-300 z-30 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b">
            <Link href={isAdmin ? '/' : getLocalizedPath('/')} className="flex items-center">
              <span className="text-2xl font-bold text-red-600">
                Portal<span className="text-gray-800">Escorts</span>
              </span>
            </Link>
          </div>

          {/* Sidebar Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-red-50 text-red-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={active ? 'text-red-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Left: Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Right: Help & Profile */}
            <div className="flex items-center space-x-4">
              {/* Help Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsHelpDropdownOpen(!isHelpDropdownOpen);
                    setIsProfileDropdownOpen(false);
                  }}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {isHelpDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href={locale === 'es' ? '/docs' : '/docs'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {locale === 'es' ? 'Base de Conocimiento' : 'Base de Conhecimento'}
                    </Link>
                    <Link
                      href={locale === 'es' ? '/docs' : '/docs'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {locale === 'es' ? 'Documentación' : 'Documentação'}
                    </Link>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    setIsHelpDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {user?.profile?.name?.[0] || user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href={`/${locale}/dashboard/dados-faturacao`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {locale === 'es' ? 'Datos de Facturación' : 'Dados de Faturação'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {locale === 'es' ? 'Cerrar Sesión' : 'Sair'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

