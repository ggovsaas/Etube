# Stories System Implementation

## Overview
Instagram-style Stories system with filtering by City and Gender.

## Database Changes

### Story Model
A new `Story` model has been added to the Prisma schema:
- `id`: Unique identifier
- `mediaUrl`: URL to the image/video
- `storyOrder`: Order for sorting stories within a profile
- `profileId`: Foreign key to Profile
- `createdAt`: Timestamp

### Profile Model
- Already has `gender` field (String?)
- Already has `city` field (String)
- Added `stories` relation (one-to-many)

## Files Created

### 1. `src/lib/data/stories.ts`
Data fetching utility with `getStoriesByFilters()` function:
- Filters by required `city` parameter
- Optionally filters by `gender` parameter
- Only returns profiles that have at least one story
- Eagerly loads stories ordered by `storyOrder`

### 2. `src/components/StoriesBar.tsx`
Server Component that displays:
- Gender filter buttons (Todos, Mulher, Homem, Trans)
- Horizontal scrollable list of story circles
- Each circle shows profile photo with gradient border (if has stories)
- Story count badge for profiles with multiple stories
- Links to `/perfil/{profileId}/stories` for viewing stories

## Usage Example

### In a Page Component

```tsx
import StoriesBar from '@/components/StoriesBar';
import { Suspense } from 'react';

export default function PerfisPage({ 
  searchParams 
}: { 
  searchParams: { city?: string; gender?: string } 
}) {
  const city = searchParams.city || 'Lisboa'; // Default city
  const gender = searchParams.gender;

  return (
    <div>
      <Suspense fallback={<div>Loading stories...</div>}>
        <StoriesBar 
          city={city} 
          gender={gender} 
          locale="pt" 
        />
      </Suspense>
      {/* Rest of your page content */}
    </div>
  );
}
```

## Database Migration

After updating the schema, run:

```bash
npx prisma generate
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name add_stories_model
```

## Creating Stories

To create stories for a profile:

```typescript
import { prisma } from '@/lib/prisma';

// Create a story
await prisma.story.create({
  data: {
    mediaUrl: 'https://example.com/story-image.jpg',
    storyOrder: 0,
    profileId: 'profile-id-here'
  }
});
```

## Filtering Logic

The `getStoriesByFilters` function:
1. Requires `city` parameter
2. Optionally filters by `gender` (Woman, Man, Trans)
3. Only includes profiles with at least one story
4. Returns profiles with their stories ordered by `storyOrder`

## Next Steps

1. **Create Story Viewer Page**: Implement `/perfil/[id]/stories` page to display stories in a full-screen viewer
2. **Story Upload**: Add functionality for users to upload stories
3. **Story Expiration**: Add automatic deletion of stories older than 24 hours
4. **Story Analytics**: Track views and interactions





