lowrys-website/
├── public/
│   ├── documents/
│   │   ├── jim-lowry-resume.pdf
│   │   └── business-process-health-assessment.xlsx  # Note: Consider moving to protected-documents in future
│   ├── protected-documents/                        # NEW: Future directory for access-controlled files
│   ├── favicon/
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   ├── favicon.ico
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   └── site.webmanifest
│   ├── images/
│   │   ├── jim-lowry-profile.jpg
│   │   └── projects/
│   │       ├── technical-infrastructure/
│   │       │   ├── GarageTransformationJourney.png
│   │       │   ├── HomeAutomation.png
│   │       │   ├── LaundryRoomTransformation.gif
│   │       │   └── NetworkTraffic.gif
│   │       └── web-development/
│   │           └── airtisan-platform.png
│   ├── firebase-messaging-sw.js      # FCM service worker for background notifications
│   ├── icon-192x192.png              # Icon for FCM notifications - MISSING, needs to be added
│   ├── icon-512x512.png              # Icon for FCM notifications - MISSING, needs to be added
│   ├── file.svg
│   ├── globe.svg
│   ├── manifest.json                 # Web app manifest
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx              # Updated to use ResumeAccessButton
│   │   ├── admin/                    # Admin area for FCM notifications
│   │   │   └── page.tsx              # React-based admin interface for managing resume requests
│   │   ├── api/
│   │   │   ├── approve-resume-request/    # API endpoint for approving resume requests
│   │   │   │   └── route.js
│   │   │   ├── deny-resume-request/       # API endpoint for denying resume requests
│   │   │   │   └── route.js
│   │   │   ├── request-resume-access/     # Updated to handle both messages and resume requests
│   │   │   │   └── route.js
│   │   │   └── validate-passcode/
│   │   │       └── route.js
│   │   ├── contact/
│   │   │   └── page.tsx               # Updated to use ResumeAccessButton
│   │   ├── projects/
│   │   │   └── page.tsx
│   │   ├── resources/
│   │   │   └── page.tsx (to be implemented)
│   │   ├── skills/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx                # Updated to include ResumeAccessProvider
│   │   └── page.tsx
│   ├── components/
│   │   ├── AdminNotifications.tsx    # React component for FCM notifications
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── MobileNavigation.tsx
│   │   ├── Navigation.tsx
│   │   ├── ResumeAccess.jsx          # Original component - can be removed after modal implementation
│   │   ├── ResumeAccessButton.tsx    # NEW: Button to trigger the resume access modal
│   │   ├── ResumeAccessContext.tsx   # NEW: Context provider for modal state management
│   │   ├── ResumeAccessModal.tsx     # NEW: Modal component for resume access
│   │   └── SocialLinks.tsx
│   ├── firebase/
│   │   └── config.ts                 # CLEANUP: Consider consolidating with firebase-client.ts
│   └── lib/
│       ├── firebase-admin.js         # Server-side Firebase Admin SDK initialization
│       ├── firebase-client.ts        # Client-side Firebase config for FCM with TypeScript
│       └── resumeAccessUtils.js      # Updated to use FCM instead of Twilio
├── functions/                        # Firebase Cloud Functions - VALIDATE if still needed
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── resume-emails/                    # CLEANUP: Likely obsolete after FCM migration
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── .env.local                        # Updated with FCM environment variables
├── .eslintrc.json
├── .firebaserc                       # Firebase project configuration
├── .gitignore
├── eslint.config.mjs
├── firebase.json                     # Firebase configuration
├── next.config.js
├── next.config.ts
├── next-env.d.ts
├── package.json                      # Updated with FCM dependencies
├── package-lock.json
├── postcss.config.mjs
├── README.md
├── project_structure.md              # This file (moved from public/documents/)
└── tsconfig.json

# Post-Project Cleanup Tasks:
# 1. Consolidate Firebase Configuration:
#    - Compare /src/firebase/config.ts and /src/lib/firebase-client.ts
#    - Update imports to use a single configuration file
#
# 2. Add Missing FCM Icons:
#    - Add icon-192x192.png and icon-512x512.png to public directory
#
# 3. Reorganize Documents:
#    - Create /public/protected-documents/ for access-controlled files
#    - Move gated content to this directory
#
# 4. Remove Obsolete Systems:
#    - Validate if resume-emails directory is still needed
#    - Validate if functions directory is still needed for Firebase
#
# 5. Convert JSX to TypeScript:
#    - Consider converting .jsx files to .tsx for consistency
