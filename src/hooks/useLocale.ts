'use client';

import { usePathname } from 'next/navigation';
import { getLocale, defaultLocale, type Locale } from '@/middleware';
import { getTranslations } from '@/lib/i18n';
import { useMemo } from 'react';

export function useLocale() {
  const pathname = usePathname() || '';
  
  const locale = useMemo(() => {
    try {
      return getLocale(pathname);
    } catch (error) {
      console.error('Error getting locale:', error);
      return defaultLocale;
    }
  }, [pathname]);
  
  const t = useMemo(() => {
    try {
      return getTranslations(locale);
    } catch (error) {
      console.error('Error getting translations:', error);
      return getTranslations(defaultLocale);
    }
  }, [locale]);

  const getLocalizedPath = (path: string): string => {
    try {
      // Remove leading slash if present
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      // Remove locale prefix if present (support all locales)
      const pathWithoutLocale = cleanPath.replace(/^(pt|es|pt-AO|nl|es-CO|pt-BR|es-CL|de|nl-BE|fr-BE)\//, '');
      // Return with current locale
      return `/${locale}/${pathWithoutLocale}`;
    } catch (error) {
      console.error('Error getting localized path:', error);
      return path;
    }
  };

  return {
    locale,
    t,
    getLocalizedPath,
  };
}

