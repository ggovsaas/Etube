'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { locales, type Locale } from '@/middleware';

export default function LocaleStorage({ locale }: { locale: Locale }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && locale && locales.includes(locale)) {
      sessionStorage.setItem('userLocale', locale);
    }
  }, [locale]);

  return null;
}




