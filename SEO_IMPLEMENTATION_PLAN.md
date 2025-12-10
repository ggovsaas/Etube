# SEO Implementation Plan

## Current Status
✅ **Implemented:**
- robots.txt (currently blocking indexing)
- sitemap.xml (dynamic generation)
- Hreflang tags
- Google Analytics 4
- Basic structured data (JSON-LD) for blog posts and listings
- Basic root layout metadata

❌ **Missing (Critical):**
- Individual page metadata (title, description, OG tags)
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- Meta descriptions for listings
- Alt text optimization
- Comprehensive structured data

## Action Plan

### 1. Temporarily Block Indexing ✅
- robots.txt now blocks all indexing
- Set `allowIndexing = true` when ready

### 2. Implement Page-Level Metadata

#### Homepage (`/[locale]/page.tsx`)
- [ ] Convert to server component or add metadata export
- [ ] Dynamic title: "EscortTube - Acompanhantes em [City] | Portugal"
- [ ] Meta description with city/keywords
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Canonical URL

#### Listing Pages (`/anuncio/[id]/page.tsx`)
- [ ] Convert to server component or add metadata export
- [ ] Dynamic title: "[Name] - Acompanhante em [City] | EscortTube"
- [ ] Meta description from profile description
- [ ] Open Graph image (profile photo)
- [ ] Structured data (ProfessionalService schema)
- [ ] Canonical URL

#### Profile Listing Page (`/[locale]/perfis/page.tsx`)
- [ ] Dynamic title: "Acompanhantes em [City] | EscortTube"
- [ ] Meta description with filters applied
- [ ] Canonical URL

#### Blog Pages
- [ ] Blog listing: "Blog - EscortTube"
- [ ] Blog post: Dynamic from post metadata (already has some)

### 3. Structured Data (JSON-LD)

#### Already Implemented:
- ✅ BlogPosting schema
- ✅ ProfessionalService schema (partial)

#### To Add:
- [ ] Organization schema (site-wide)
- [ ] BreadcrumbList schema
- [ ] WebSite schema with search action
- [ ] Person schema for profiles
- [ ] Review/Rating schema

### 4. Technical SEO

#### Image Optimization
- [ ] Add alt text to all images
- [ ] Optimize image sizes
- [ ] Use Next.js Image component

#### URL Structure
- [x] Clean URLs (no mixed languages)
- [ ] Canonical URLs for all pages
- [ ] 301 redirects for old URLs

#### Performance
- [ ] Core Web Vitals optimization
- [ ] Lazy loading for images
- [ ] Code splitting

### 5. Content SEO

#### Meta Descriptions
- [ ] Homepage: Compelling description with keywords
- [ ] Listings: Unique descriptions per profile
- [ ] Blog: Use metaDescription field
- [ ] Category pages: City-specific descriptions

#### Title Tags
- [ ] Unique, descriptive titles (50-60 chars)
- [ ] Include location/city when relevant
- [ ] Include brand name

### 6. Local SEO

#### For Portugal/Spain
- [ ] Location-specific meta tags
- [ ] City-specific landing pages
- [ ] Local business schema
- [ ] Google My Business integration (if applicable)

## Implementation Priority

### Phase 1: Critical (Do Before Re-enabling Indexing)
1. ✅ Block indexing
2. Implement homepage metadata
3. Implement listing page metadata
4. Add Open Graph tags
5. Add canonical URLs
6. Complete structured data

### Phase 2: Important (Within 1 week)
1. Profile listing page metadata
2. Blog metadata completion
3. Image alt text
4. Meta descriptions optimization

### Phase 3: Optimization (Ongoing)
1. Performance optimization
2. Content optimization
3. Local SEO
4. Schema markup expansion

## How to Re-enable Indexing

1. Complete Phase 1 items
2. Test all metadata with:
   - Google Rich Results Test
   - Facebook Sharing Debugger
   - Twitter Card Validator
3. Update `robots.ts`: Set `allowIndexing = true`
4. Submit sitemap to Google Search Console
5. Monitor indexing status

## Testing Tools

- Google Rich Results Test: https://search.google.com/test/rich-results
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Google Search Console: Monitor indexing
- Screaming Frog: Crawl site for SEO issues

