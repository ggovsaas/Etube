# 🗺️ Global-Native Strategy: Sanity Check & Roadmap

## ✅ **FINAL STRATEGY: Local-First, Global-English**

### Core Principles:
1. **Default Behavior**: Users see ONLY their native market listings (geographic filtering)
2. **Manual Exploration**: Users can browse other countries via `/network` page
3. **Language Detection**: Browser language → auto locale, with manual switcher
4. **SEO Strategy**: Hybrid - Native/Local SEO (PT, NL, ES) for listings + English/Global SEO for content

---

## 📋 **SANITY CHECKLIST**

### ✅ **COMPLETED:**
- [x] Network page created (`/network`) with all countries
- [x] Network link added to footer
- [x] Profiles API filters by native market (locale-based city filtering)
- [x] Hreflang tags implemented (generic `en` for English, `x-default` to `/pt/`)
- [x] Pulse page created with Stories Bar and Post Cards
- [x] Basic i18n system in place (23 locales supported)

### ✅ **COMPLETED (Latest Update):**

#### 1. **Pulse Feed Logic** ✅
**Status**: IMPLEMENTED
- Feed API now accepts `locale` parameter
- **STRICTLY FILTERS** listings by geographic region (native market only)
- Mixes ALL UGC content (photos, videos, stories) - language prioritized
- Standalone creators (no listings) appear in all feeds (global content)
- Service providers (escorts/creators with listings) only appear in their native market

**Files Updated:**
- ✅ `src/app/api/feed/route.ts` - Added locale parameter and geographic filtering
- ✅ `src/app/[locale]/pulse/page.tsx` - Passes locale to API

#### 2. **I18N Cleanup (Partial)** ✅
**Status**: PARTIALLY COMPLETE
- ✅ `src/app/[locale]/criar-anuncio/page.tsx` - Auth modal now uses i18n
- ✅ Added missing translation keys (loginRequired, loginRequiredMessage, makeLogin, createAccount, continueEditing)
- ⚠️ `src/app/[locale]/criar-perfil/page.tsx` - Still uses inline translations (needs update)
- ✅ `src/app/[locale]/login/page.tsx` - Already uses i18n (verified)

### ⚠️ **REMAINING TASKS:**

#### 1. **I18N Cleanup (criar-perfil)** (MEDIUM PRIORITY)
**Problem**: `criar-perfil` uses inline translations instead of i18n.ts
**Action**: Replace inline translation object with `useLocale()` hook and `t.key` calls

#### 3. **Hreflang Verification** (MEDIUM PRIORITY)
**Status**: Already implemented correctly ✅
- Generic `hreflang="en"` for all English variants
- `x-default` points to `/pt/`
- Need to verify output in production

#### 4. **Network Page Verification** (LOW PRIORITY)
**Status**: Already created ✅
- Shows all 20+ countries
- Links to correct locale URLs
- Highlights current country

---

## 🎯 **IMPLEMENTATION PRIORITY**

### **Phase 1: Pulse Feed Geographic Filtering** (CRITICAL)
**Why**: Users in Portugal must see ONLY Portuguese listings in Pulse feed
**Impact**: High - affects user experience and geographic relevance

### **Phase 2: I18N Cleanup** (CRITICAL)
**Why**: Users need native language support across all pages
**Impact**: High - affects user experience and SEO

### **Phase 3: Verification** (MEDIUM)
**Why**: Ensure everything works as expected
**Impact**: Medium - quality assurance

---

## 🔍 **TECHNICAL DETAILS**

### **Pulse Feed Filtering Logic:**
```typescript
// Pseudocode
1. Fetch ALL ContentItems (photos, videos, stories) - no geographic filter
2. For each ContentItem:
   - If linked to a Listing/Profile:
     - Check if Listing.city matches locale's cities
     - If NO match → exclude from feed
   - If standalone content (no listing):
     - Include (language prioritized)
3. Return filtered results
```

### **Locale-to-City Mapping:**
- `/pt/` → Portuguese cities (Lisboa, Porto, etc.)
- `/es/` → Spanish cities (Madrid, Barcelona, etc.)
- `/en-GB/` → UK cities (London, Manchester, etc.)
- `/pl/` → Polish cities (Warsaw, Krakow, etc.)
- etc.

### **Hreflang Structure:**
```html
<link rel="alternate" hreflang="pt" href="https://www.escorttube.vip/pt/..." />
<link rel="alternate" hreflang="es" href="https://www.escorttube.vip/es/..." />
<link rel="alternate" hreflang="en" href="https://www.escorttube.vip/en/..." />
<link rel="alternate" hreflang="x-default" href="https://www.escorttube.vip/pt/..." />
```

---

## 📝 **NEXT STEPS**

1. ✅ Read this roadmap
2. ⏳ Implement Pulse feed geographic filtering
3. ⏳ Complete I18N cleanup (criar-anuncio, criar-perfil)
4. ⏳ Test all locales
5. ⏳ Deploy and verify

---

**Last Updated**: 2024-01-XX
**Status**: In Progress

