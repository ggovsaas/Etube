# Listing/Anuncio Page - Design Guide

## Overview
Complete rebuild of the listing detail page (`/anuncio/[id]`) based on provided designs. This replaces all previous implementations (Gemini blueprint, old profile format).

## Design Requirements

### Desktop Layout

#### Main Profile Card (Top Section)
- **Left Side (40-45% width):**
  - Large profile image (aspect ratio ~4:5 or 3:4)
  - "Verificada" badge overlay (top-left corner of image)
  
- **Right Side (55-60% width):**
  - Tags: "Feminino" (or gender), "Disponível Agora" (or status)
  - Name and Age: Large, bold (e.g., "Isabella Silva, 24")
  - Location: With location icon (e.g., "Jardins, São Paulo")
  - Quick Stats Row (3 columns):
    - "ALTURA" (Height): e.g., "1.72m"
    - "PESO" (Weight): e.g., "58kg"
    - "OLHOS" (Eyes): e.g., "Verdes"
  - Contact Buttons:
    - WhatsApp button (green, if enabled)
    - "Ver Telefone" button (red/brand color)

#### Left Column (Main Content - 8/12 width)
1. **"Sobre Mim" Section:**
   - Title: "Sobre Mim"
   - Description text (with "Ler mais" toggle on mobile)
   - Personality tags below description (e.g., "Divertida", "Elegante", "Carinhosa", "Mente Aberta", "GFE")

2. **"Minha Galeria" Section:**
   - Title: "Minha Galeria"
   - Subtitle: "{count} fotos disponíveis"
   - Masonry/grid layout (2-3 columns on desktop)
   - Images with hover effects

3. **"Detalhes Físicos" Section:**
   - Title: "Detalhes Físicos"
   - Grid of physical attributes (2-3 columns):
     - ALTURA (Height) - Ruler icon
     - PESO (Weight) - Weight icon
     - CORPO (Body Type) - Person icon
     - BUSTO (Bust) - Heart icon (e.g., "90cm (Silicone)")
     - OLHOS (Eyes) - Eye icon
     - CABELO (Hair) - Star icon
     - ETNIA (Ethnicity) - Globe icon
     - PÉS (Shoe Size) - Music note icon
     - FUMANTE (Smoker) - Sparkles icon (Sim/Não)
     - IDIOMAS (Languages) - Globe icon (comma-separated)
   - Tattoos & Piercings (if present):
     - Separate cards below grid
     - "TATUAGENS" with description
     - "PIERCINGS" with description

4. **"Serviços Oferecidos" Section:**
   - Title: "Serviços Oferecidos"
   - Grid of service tags with checkmark icons
   - Each service: Red checkmark circle + service name
   - Hover effects on tags

5. **"Vídeos de Comparação" Section (if videos exist):**
   - Title: "Vídeos de Comparação"
   - Subtitle: "Realidade sem filtros"
   - Grid of video thumbnails (2-3 columns)
   - Play icon overlay on videos
   - "VERIFICADO" badge on videos

6. **"Redes Sociais" Section:**
   - Title: "Redes Sociais"
   - Horizontal buttons for each social platform:
     - Instagram (gradient: orange-pink-purple)
     - Twitter (black)
     - OnlyFans (blue)
     - WhatsApp Business (green)
     - Others as needed

#### Right Sidebar (Sticky - 4/12 width)
1. **"Interessado?" Contact Card:**
   - Title: "Interessado?"
   - Subtitle: "Entre em contato agora"
   - Contact buttons:
     - WhatsApp (green, if enabled)
     - Telegram (blue, if enabled)
     - Phone number button (gray)
   - "AVISO PRÉVIO SUGERIDO": Shows notice period (e.g., "2 Horas")

2. **"Investimento" Pricing Card:**
   - Title: "$ Investimento" (with dollar icon)
   - Tabs: "Local" and "Deslocação"
   - Pricing list for selected tab:
     - Each item: Clock icon + duration + price (e.g., "1h" → "R$ 400")
   - Payment info: "PAGAMENTO" (Cartão & Dinheiro / Apenas Dinheiro)
   - Promotion info: "PROMOÇÃO" (Desc. para Regulares / Sem descontos)

3. **"Ver perfis com o mesmo número" Button:**
   - Gray button with users icon
   - Links to `/perfis/mesmo-numero/{phone}`

4. **Security Tip Card:**
   - Blue background
   - "DICA DE SEGURANÇA" title with verified icon
   - Text: "Nunca envie pagamentos antecipados sem verificação. O PortalEscorts recomenda o contato inicial via WhatsApp ou Vídeo."

### Mobile Layout

1. **Hero Section (Full Width):**
   - Full-width image (aspect ratio ~4:5)
   - Gradient overlay (dark at bottom, transparent at top)
   - Overlay content at bottom:
     - Tags: Gender, Verified badge
     - Name and Age (large, white text)
     - Location (with icon)

2. **"Sobre Mim" Card:**
   - White card below hero
   - Title: "Sobre Mim"
   - Description (truncated with "Ler mais" link)
   - Personality tags below

3. **"Minha Galeria":**
   - Title and subtitle
   - 2-column grid of images

4. **"Detalhes Físicos":**
   - Grid of physical attributes (2 columns on mobile)

5. **"Serviços Oferecidos":**
   - Service tags in grid

6. **"Vídeos de Comparação":**
   - Video thumbnails in grid

7. **"Redes Sociais":**
   - Social buttons (full width on mobile)

8. **"Investimento":**
   - Pricing section with tabs

9. **Fixed Bottom Bar (Mobile Only):**
   - WhatsApp button (green, left)
   - "Ligar" button (red/brand, right)
   - Only visible on mobile (< lg breakpoint)

## Technical Requirements

### Data Mapping
- Map from existing `Listing` and `Profile` Prisma models
- Handle missing/null data gracefully
- Conditional rendering: Only show sections/fields with data

### Image Handling
- Use placeholder images for missing/broken images
- Validate image URLs (must be HTTP/HTTPS, not `/uploads/`)
- Lazy loading for gallery images
- Error handlers on all images

### Responsive Breakpoints
- Mobile: < 768px (md)
- Tablet: 768px - 1024px (md-lg)
- Desktop: > 1024px (lg+)

### Color Scheme
- Brand Red: `#dd3d29` or `#ef4444`
- Green (WhatsApp): `#25D366`
- Blue (Telegram): `#0088cc`
- Gray scale: Use Tailwind gray palette

### Components to Create/Use
- `ProfileHero` - Main profile card (desktop split, mobile full-width)
- `PhysicalStats` - Physical details grid
- `ServiceTags` - Services grid
- `GalleryGrid` - Image gallery
- `ComparisonVideos` - Video thumbnails
- `SocialLinks` - Social media buttons
- `PricingCard` - Pricing sidebar card
- `ContactCard` - Contact sidebar card

## Files to Remove
1. All Gemini blueprint components:
   - `src/components/listing/ProfileComponents.tsx` (old version)
   - `src/components/listing/Icons.tsx` (if Gemini-specific)
   - `src/components/listing/UI.tsx` (if Gemini-specific)
   - `src/components/listing/types.ts` (if Gemini-specific)

2. Old profile page:
   - `src/app/perfis/[id]/page.tsx` (already redirects, but clean up)

3. Current anuncio page:
   - `src/app/anuncio/[id]/page.tsx` (rebuild from scratch)

## Implementation Steps
1. ✅ Create this guide
2. Remove Gemini blueprint components
3. Remove old profile format references
4. Remove current anuncio page
5. Create new component structure
6. Build desktop layout
7. Build mobile layout
8. Add conditional rendering
9. Test with real data
10. Handle edge cases

## Notes
- **NO HEADER** - Use existing site header
- **NO QUOTE IN RED BORDER** - Fill that space with name/age, location, tags, quick stats, contact buttons
- All sections should conditionally render based on data availability
- Use proper TypeScript types
- Add error boundaries
- Ensure accessibility (alt texts, ARIA labels)






