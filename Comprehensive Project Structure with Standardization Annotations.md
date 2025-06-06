# Comprehensive Project Structure with Standardization Annotations

## Layout System Description
This project uses Next.js App Router with a centralized layout architecture. The system consists of:
1. A root layout.tsx server component that defines the overall page structure and exports metadata
2. A Header component (client component) that provides navigation across all pages
3. A ResumeAccessProvider context that wraps the entire application for modal functionality
4. Individual page components that focus solely on page-specific content
5. Files use @/ path aliases

This architecture follows Next.js best practices by separating server components (layout.tsx) from client components (Header.tsx), maintaining proper context boundaries, and providing consistent navigation through a single source of truth in the root layout.

## Directory Structure

```
lowrys-website/
├── public/                           # Static assets (unchanged)
│   ├── documents/
│   │   ├── jim-lowry-resume.pdf
│   │   └── business-process-health-assessment.xlsx
│   ├── protected-documents/          # For access-controlled files (unchanged)
│   ├── favicon/                      # Favicon files (unchanged)
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   ├── favicon.ico
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   └── site.webmanifest
│   ├── images/                       # Image assets (unchanged)
│   │   ├── jim-lowry-profile.jpg
│   │   └── projects/
│   │       ├── technical-infrastructure/
│   │       │   ├── GarageTransformationJourney.png
│   │       │   ├── HomeAutomation.png
│   │       │   ├── LaundryRoomTransformation.gif
│   │       │   └── NetworkTraffic.gif
│   │       └── web-development/
│   │           └── airtisan-platform.png
│   ├── firebase-messaging-sw.js      # FCM service worker (unchanged)
│   ├── icon-192x192.png              # FCM notification icon (unchanged)
│   ├── icon-512x512.png              # FCM notification icon (unchanged)
│   ├── file.svg                      # SVG assets (unchanged)
│   ├── globe.svg
│   ├── manifest.json                 # Web app manifest (unchanged)
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx              # MODIFY: Remove Layout wrapper, keep ResumeAccessButton
│   │   ├── admin/
│   │   │   └── page.tsx              # MODIFY: Remove Layout wrapper, keep PendingRequestsTable
│   │   ├── api/                      # API routes (mostly unchanged)
│   │   │   ├── approve-resume-request/
│   │   │   │   └── route.js          # KEEP: Already using standardized approach
│   │   │   ├── deny-resume-request/
│   │   │   │   └── route.js          # KEEP: Already using standardized approach
│   │   │   ├── request-resume-access/
│   │   │   │   └── route.js          # KEEP: Already updated for categories
│   │   │   └── validate-passcode/
│   │   │       └── route.js          # KEEP: Already using standardized approach
│   │   ├── contact/
│   │   │   └── page.tsx              # MODIFY: Remove Layout wrapper, keep form with categories
│   │   ├── projects/
│   │   │   └── page.tsx              # MODIFY: Remove Layout wrapper
│   │   ├── resources/
│   │   │   └── page.tsx              # MODIFY: Remove Layout wrapper if present
│   │   ├── skills/
│   │   │   └── page.tsx              # MODIFY: Remove Layout wrapper
│   │   ├── globals.css               # KEEP: Global styles (unchanged)
│   │   ├── layout.tsx                # UPDATED: Now includes Header and ResumeAccessProvider
│   │   └── page.tsx                  # MODIFY: Remove Layout wrapper
│   ├── components/
│   │   ├── AdminNotifications.tsx    # MODIFY: Add 'use client' if using hooks
│   │   ├── Header.tsx                # MODIFY: Add 'use client' directive (CRITICAL)
│   │   ├── Layout.tsx                # DEPRECATED: Remove after all pages are updated
│   │   ├── MobileNavigation.tsx      # MODIFY: Add 'use client' if using hooks
│   │   ├── Navigation.tsx            # MODIFY: Add 'use client' if using hooks
│   │   ├── ResumeAccess.jsx          # DEPRECATED: Remove after modal implementation
│   │   ├── ResumeAccessButton.tsx    # MODIFY: Add 'use client' directive
│   │   ├── ResumeAccessContext.tsx   # KEEP: Context provider (already updated)
│   │   ├── ResumeAccessModal.tsx     # MODIFY: Add 'use client' directive
│   │   ├── PendingRequestsTable.tsx  # MODIFY: Add 'use client' if using hooks
│   │   └── SocialLinks.tsx           # MODIFY: Add 'use client' if using hooks
│   ├── firebase/
│   │   └── config.ts                 # KEEP: Firebase configuration
│   └── lib/
│       ├── firebase-admin.js         # KEEP: Server-side Firebase Admin SDK
│       ├── firebase-client.ts        # KEEP: Client-side Firebase config
│       ├── resumeAccessUtils.js      # KEEP: Utility functions
│       └── useFormValidation.js      # KEEP: Form validation hook
├── functions/                        # Firebase Cloud Functions
│   ├── index.js                      # KEEP: If still needed for Firebase
│   ├── package.json
│   └── package-lock.json
├── resume-emails/                    # DEPRECATED: Likely obsolete after FCM migration
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── .env.local                        # KEEP: Environment variables
├── .eslintrc.json                    # KEEP: ESLint configuration
├── .firebaserc                       # KEEP: Firebase project configuration
├── .gitignore                        # KEEP: Git ignore rules
├── eslint.config.mjs                 # KEEP: ESLint configuration
├── firebase.json                     # KEEP: Firebase configuration
├── next.config.js                    # KEEP: Next.js configuration
├── next.config.ts                    # KEEP: Next.js TypeScript configuration
├── next-env.d.ts                     # KEEP: Next.js TypeScript declarations
├── package.json                      # KEEP: Project dependencies
├── package-lock.json                 # KEEP: Dependency lock file
├── postcss.config.mjs                # KEEP: PostCSS configuration
├── README.md                         # KEEP: Project documentation
├── project_structure.md              # UPDATE: Replace with this comprehensive version
├── tailwind.config.js                # KEEP: Tailwind CSS configuration
└── tsconfig.json                     # KEEP: TypeScript configuration
```

## Detailed Standardization Changes

### 1. Root Layout (src/app/layout.tsx) - COMPLETED ✅
- **BEFORE**: Simple layout without Header or ResumeAccessProvider
- **AFTER**: Comprehensive layout with Header and ResumeAccessProvider
- **CHANGES MADE**:
  - Added import for Header component
  - Added import for ResumeAccessProvider
  - Wrapped children and Header in ResumeAccessProvider
  - Preserved all metadata and favicon configurations

### 2. Client Components - CRITICAL CHANGES NEEDED ⚠️
The following components need the 'use client' directive added at the very top:

- **Header.tsx** - CRITICAL: Uses useState, must have 'use client'
  ```tsx
  'use client';
  
  import { useState } from 'react';
  // rest of the component
  ```

- **Navigation.tsx** - If using hooks
- **MobileNavigation.tsx** - If using hooks
- **ResumeAccessButton.tsx** - If using hooks
- **ResumeAccessModal.tsx** - If using hooks
- **PendingRequestsTable.tsx** - If using hooks
- **AdminNotifications.tsx** - If using hooks
- **SocialLinks.tsx** - If using hooks

### 3. Page Components - LAYOUT WRAPPER REMOVAL 🗑️
All page components need the Layout wrapper removed:

- **src/app/page.tsx** (root page)
- **src/app/about/page.tsx**
- **src/app/admin/page.tsx**
- **src/app/contact/page.tsx**
- **src/app/projects/page.tsx**
- **src/app/skills/page.tsx**
- **src/app/resources/page.tsx** (if implemented)

**Example Change**:
```tsx
// BEFORE - Wrong style with Layout wrapper
import Layout from '@/components/Layout';

export default function Page() {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        {/* Page content */}
      </main>
    </Layout>
  );
}

// AFTER - Correct style without Layout wrapper
export default function Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page content */}
    </main>
  );
}
```

### 4. Import Standardization 📦
All imports should use @/ path aliases instead of relative paths:

```tsx
// WRONG STYLE - Relative imports
import Header from '../../components/Header';
import { useFormValidation } from '../lib/useFormValidation';

// CORRECT STYLE - Path aliases
import Header from '@/components/Header';
import { useFormValidation } from '@/lib/useFormValidation';
```

### 5. Files to Remove After Migration 🗑️
These files should be removed once the migration is complete:

- **src/components/Layout.tsx** - Deprecated by root layout.tsx
- **src/components/ResumeAccess.jsx** - Replaced by ResumeAccessModal.tsx
- **resume-emails/** directory - Obsolete after FCM migration

## Implementation Order

1. ✅ Update root layout.tsx with Header and ResumeAccessProvider (COMPLETED)
2. ⚠️ Add 'use client' directive to Header.tsx (CRITICAL NEXT STEP)
3. 🔄 Update other client components with 'use client' directive
4. 🔄 Remove Layout wrapper from pages one at a time:
   - contact/page.tsx
   - admin/page.tsx
   - about/page.tsx
   - projects/page.tsx
   - skills/page.tsx
   - resources/page.tsx
   - page.tsx (root)
5. 🔄 Standardize imports across all files
6. 🔄 Remove deprecated files

## Benefits of Standardization

- **Simplified Component Hierarchy**: Clear parent-child relationships
- **Consistent Navigation**: Navigation available on all pages
- **Proper Context Boundaries**: ResumeAccessProvider wraps entire application
- **Improved Maintainability**: Single source of truth for layout
- **Better Performance**: Reduced component nesting and re-renders
- **Cleaner Codebase**: Standardized imports and component patterns

## Post-Standardization Cleanup Tasks

1. **Consolidate Firebase Configuration**:
   - Compare /src/firebase/config.ts and /src/lib/firebase-client.ts
   - Update imports to use a single configuration file

2. **Add Missing FCM Icons** (if not already done):
   - Add icon-192x192.png and icon-512x512.png to public directory

3. **Reorganize Documents**:
   - Create /public/protected-documents/ for access-controlled files
   - Move gated content to this directory

4. **Remove Obsolete Systems**:
   - Validate if resume-emails directory is still needed
   - Validate if functions directory is still needed for Firebase

5. **Convert JSX to TypeScript**:
   - Consider converting .jsx files to .tsx for consistency
