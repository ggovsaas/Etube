'use client';

import { defaultLocale } from '@/middleware';

/**
 * Get user's locale from various sources:
 * 1. sessionStorage (set during login/navigation)
 * 2. Browser language
 * 3. Default locale (pt)
 */
export function getUserLocale(): string {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // Try sessionStorage first
  const storedLocale = sessionStorage.getItem('userLocale');
  if (storedLocale && (storedLocale === 'pt' || storedLocale === 'es')) {
    return storedLocale;
  }

  // Try browser language
  const browserLang = navigator.language || navigator.languages?.[0] || defaultLocale;
  if (browserLang.startsWith('es')) {
    return 'es';
  }

  return defaultLocale;
}

/**
 * Get localized dashboard path
 */
export function getDashboardPath(): string {
  const locale = getUserLocale();
  return `/${locale}/dashboard`;
}




