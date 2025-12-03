'use client';

import { usePathname } from 'next/navigation';
import { locales, defaultLocale } from '@/middleware';
import { getAlternateUrls } from '@/lib/i18n';

export default function HreflangTags() {
  const pathname = usePathname();
  const { current, alternates } = getAlternateUrls(pathname);

  return (
    <>
      {alternates.map(({ locale, url }) => (
        <link key={locale} rel="alternate" hrefLang={locale} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={alternates.find(a => a.locale === defaultLocale)?.url || current} />
    </>
  );
}


