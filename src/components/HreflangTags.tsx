'use client';

import { usePathname } from 'next/navigation';
import { locales, defaultLocale } from '@/middleware';
import { getAlternateUrls } from '@/lib/i18n';

export default function HreflangTags() {
  const pathname = usePathname();
  const { current, alternates } = getAlternateUrls(pathname);

  // Normalize English variants to generic "en" for global targeting
  const normalizedAlternates = alternates.map(({ locale, url }) => {
    // All English variants (en-US, en-GB, en-ZA, en-CY) use generic "en" hreflang
    const hreflang = locale.startsWith('en') ? 'en' : locale;
    return { locale, hreflang, url };
  });

  // Get Portuguese default URL for x-default
  const ptUrl = alternates.find(a => a.locale === defaultLocale)?.url || current;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.escorttube.vip';
  const defaultUrl = ptUrl.includes(baseUrl) ? ptUrl : `${baseUrl}/pt/`;

  return (
    <>
      {normalizedAlternates.map(({ locale, hreflang, url }) => (
        <link key={locale} rel="alternate" hrefLang={hreflang} href={url} />
      ))}
      {/* x-default points to Portuguese (primary market) */}
      <link rel="alternate" hrefLang="x-default" href={defaultUrl} />
    </>
  );
}


