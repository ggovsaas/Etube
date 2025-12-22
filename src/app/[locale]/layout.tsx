import { locales, type Locale } from '@/middleware';
import { notFound } from 'next/navigation';
import LocaleStorage from '@/components/LocaleStorage';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  return (
    <>
      <LocaleStorage locale={locale} />
      {children}
    </>
  );
}

