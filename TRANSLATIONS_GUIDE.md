# Translations Guide

## How Translations Work

**Translations are MANUAL, not automatic.** You need to manually add translations to the translation file.

### Current System

1. **Translation File**: `src/lib/i18n.ts`
   - Contains all translations for Portuguese (pt) and Spanish (es)
   - Each language has its own object with key-value pairs

2. **How It Works**:
   - When a user visits `/pt/...`, they see Portuguese text
   - When a user visits `/es/...`, they see Spanish text
   - The middleware automatically detects the locale from the URL

3. **Adding New Translations**:
   ```typescript
   // In src/lib/i18n.ts
   export const translations = {
     pt: {
       myNewKey: 'Texto em Português',
       // ... more translations
     },
     es: {
       myNewKey: 'Texto en Español',
       // ... more translations
     },
   };
   ```

4. **Using Translations in Components**:
   ```tsx
   'use client';
   import { useLocale } from '@/hooks/useLocale';
   
   export default function MyComponent() {
     const { t } = useLocale();
     
     return <h1>{t.myNewKey}</h1>;
   }
   ```

### Automatic Translation (NOT Implemented)

If you want **automatic translation** (like DeepL API), you would need to:
1. Install a translation API client (e.g., DeepL, Google Translate)
2. Create an API route that translates content on-the-fly
3. Cache translations to avoid API costs
4. This is more complex and costs money per translation

### Current Status

✅ **Manual translations are set up and working**
- Navigation menu translates
- Homepage hero section translates
- Footer links translate

⚠️ **Still need manual translation for**:
- All page content (descriptions, headings, etc.)
- Form labels and buttons
- Error messages
- Any other text on the site

### Adding More Translations

To add more translations:

1. Open `src/lib/i18n.ts`
2. Add your translation keys to both `pt` and `es` objects
3. Use `const { t } = useLocale()` in your component
4. Replace hardcoded text with `t.yourKey`

Example:
```typescript
// In i18n.ts
pt: {
  welcomeMessage: 'Bem-vindo ao nosso site',
},
es: {
  welcomeMessage: 'Bienvenido a nuestro sitio',
}

// In component
const { t } = useLocale();
<h1>{t.welcomeMessage}</h1>
```




