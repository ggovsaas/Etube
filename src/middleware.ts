import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported locales
// Core languages: Portuguese (pt), Spanish (es), English (en), German (de), Dutch (nl), French (fr)
// Country variants:
// - Portuguese: pt (Portugal), pt-BR (Brazil), pt-AO (Angola)
// - Spanish: es (Spain), es-MX (Mexico), es-CO (Colombia), es-CL (Chile), es-UY (Uruguay)
// - English: en-US (USA), en-GB (UK), en-ZA (South Africa), en-CY (Cyprus)
// - German: de (Germany)
// - Dutch: nl (Netherlands), nl-BE (Belgium)
// - French: fr (France), fr-BE (Belgium)
// - Other: el (Greece), el-CY (Cyprus Greek), it (Italy), pl (Poland), hr (Croatia)
export const locales = [
  'pt',      // Portugal
  'pt-BR',   // Brazil
  'pt-AO',   // Angola
  'es',      // Spain
  'es-MX',   // Mexico
  'es-CO',   // Colombia
  'es-CL',   // Chile
  'es-UY',   // Uruguay
  'en',      // English (defaults to en-US)
  'en-US',   // USA
  'en-GB',   // UK
  'en-ZA',   // South Africa
  'en-CY',   // Cyprus (English)
  'de',      // Germany
  'nl',      // Netherlands
  'nl-BE',   // Belgium (Dutch)
  'fr',      // France
  'fr-BE',   // Belgium (French)
  'el',      // Greece
  'el-CY',   // Cyprus (Greek)
  'it',      // Italy
  'pl',      // Poland
  'hr',      // Croatia
] as const;
export const defaultLocale = 'pt' as const;

export type Locale = (typeof locales)[number];

// Get locale from pathname
export function getLocale(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  
  return defaultLocale;
}

// Remove locale from pathname
export function removeLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return '/' + segments.slice(1).join('/');
  }
  
  return pathname;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that don't need locale prefix
  const nonLocalizedRoutes = [
    '/api',
    '/_next',
    '/admin', // Admin stays without locale
    '/auth',
    '/uploads',
    '/anuncio', // Keep anuncio without locale for now (can be moved later)
    '/editar-anuncio',
    '/publicar-anuncio',
  ];

  // For admin routes, prevent caching to ensure fresh session checks
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Skip middleware for non-localized routes and static files
  if (
    nonLocalizedRoutes.some(route => pathname.startsWith(route)) ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Handle root path - redirect to default locale
  if (pathname === '/') {
    const newUrl = new URL(`/${defaultLocale}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale in pathname, redirect to default locale
  if (!pathnameHasLocale) {
    const locale = defaultLocale;
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    // Preserve query params and hash
    newUrl.search = request.nextUrl.search;
    newUrl.hash = request.nextUrl.hash;
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files)
     * - admin (admin routes - no locale)
     * - auth (auth routes - no locale, but login is now localized)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|admin|auth|anuncio|editar-anuncio|publicar-anuncio).*)',
  ],
};

