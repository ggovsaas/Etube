# i18n Implementation Guide

## Overview
This project implements multi-language support for Portugal (pt) and Spain (es) using Next.js App Router with subdirectory routing.

## URL Structure
- **Portugal**: `yourwebsite.com/pt/...`
- **Spain**: `yourwebsite.com/es/...`
- **Default**: Redirects to `/pt`

## Implementation Details

### 1. Middleware (`src/middleware.ts`)
- Automatically redirects root requests to `/pt`
- Handles locale detection from URL
- Skips middleware for API routes, admin routes, and static files

### 2. Translation Files (`src/lib/i18n.ts`)
- Contains translations for Portuguese (pt) and Spanish (es)
- Use `getTranslations(locale)` to get translations
- Use `getAlternateUrls(pathname, baseUrl)` to generate hreflang URLs

### 3. Hreflang Tags (`src/components/HreflangTags.tsx`)
- Automatically generates hreflang tags for SEO
- Includes `x-default` pointing to Portuguese version
- Added to root layout

### 4. Locale Hook (`src/hooks/useLocale.ts`)
- `useLocale()` hook provides:
  - `locale`: Current locale
  - `t`: Translation object
  - `getLocalizedPath(path)`: Get localized version of a path

### 5. Locale-Aware Links (`src/components/LocaleLink.tsx`)
- Use `<LocaleLink>` instead of `<Link>` for internal navigation
- Automatically prefixes paths with current locale

## Next Steps

### To Complete the Implementation:

1. **Restructure Pages** (Recommended):
   - Move pages from `src/app/page.tsx` to `src/app/[locale]/page.tsx`
   - Move other pages similarly (e.g., `src/app/perfis/page.tsx` → `src/app/[locale]/perfis/page.tsx`)
   - Keep `admin` and `api` routes at root level (they don't need localization)

2. **Update All Links**:
   - Replace `<Link href="/perfis">` with `<LocaleLink href="/perfis">`
   - Or use `getLocalizedPath()` from `useLocale()` hook

3. **Update Translations**:
   - Add more translation keys to `src/lib/i18n.ts` as needed
   - Use `const { t } = useLocale()` in components

4. **Set Base URL**:
   - Update `getAlternateUrls()` in `src/lib/i18n.ts` with your actual domain
   - Currently defaults to `https://yourwebsite.com`

## Example Usage

```tsx
'use client';

import { useLocale } from '@/hooks/useLocale';
import LocaleLink from '@/components/LocaleLink';

export default function MyComponent() {
  const { locale, t } = useLocale();

  return (
    <div>
      <h1>{t.findPerfectCompanion}</h1>
      <LocaleLink href="/perfis">{t.profiles}</LocaleLink>
    </div>
  );
}
```

## Current Status
- ✅ Middleware configured
- ✅ Translation system created
- ✅ Hreflang tags implemented
- ✅ Locale detection working
- ⚠️ Pages need to be restructured to [locale] folder
- ⚠️ Links need to be updated to use LocaleLink




