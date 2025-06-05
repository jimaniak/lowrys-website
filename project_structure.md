lowrys-website/
├── public/
│   ├── documents/
│   │   └── jim-lowry-resume.pdf
│   ├── protected-documents/          # NEW: Directory for access-controlled files by category
│   │   ├── resume/                   # Resume-specific protected files
│   │   ├── free_item/                # Free item downloads
│   │   └── portfolio/                # Portfolio-specific protected files
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
│   ├── icon-192x192.png              # Icon for FCM notifications
│   ├── icon-512x512.png              # Icon for FCM notifications
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── admin/                    # Admin area for FCM notifications
│   │   │   └── page.tsx              # Enhanced admin interface with pending requests table
│   │   ├── api/
│   │   │   ├── approve-resume-request/    # API endpoint for approving resume requests with category support
│   │   │   │   └── route.js
│   │   │   ├── deny-resume-request/       # API endpoint for denying resume requests
│   │   │   │   └── route.js
│   │   │   ├── request-resume-access/     # Updated to handle both messages and resume requests with categories
│   │   │   │   └── route.js               # Now includes duplicate request prevention by category
│   │   │   └── validate-passcode/         # Updated to validate passcodes with category support
│   │   │       └── route.js
│   │   ├── contact/
│   │   │   └── page.tsx               # Updated with category selection dropdown
│   │   ├── projects/
│   │   │   └── page.tsx
│   │   ├── resources/
│   │   │   └── page.tsx (to be implemented)
│   │   ├── skills/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AdminNotifications.tsx    # React component for FCM notifications
│   │   ├── ContactFormMessage.tsx    # Component for displaying form submission messages
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── MobileNavigation.tsx
│   │   ├── Navigation.tsx
│   │   ├── PendingRequestsTable.tsx  # New component for displaying and managing pending requests with category support
│   │   ├── ResumeAccess.tsx          # Updated to work with FCM instead of Twilio
│   │   ├── ResumeAccessButton.tsx    # Button component for triggering resume access modal
│   │   ├── ResumeAccessContext.tsx   # Context provider for resume access state
│   │   ├── ResumeAccessModal.tsx     # Modal component for entering passcode with validation
│   │   └── SocialLinks.tsx
│   ├── hooks/
│   │   └── useFormValidation.ts      # Custom hook for form validation
│   └── lib/
│       ├── firebase-admin.js         # Server-side Firebase Admin SDK initialization
│       ├── firebase-client.ts        # Client-side Firebase config for FCM with TypeScript
│       └── resumeAccessUtils.js      # Updated to use FCM instead of Twilio with category support
├── docs/
│   └── category_testing_guide.md     # Guide for testing the category-based access management system
├── .env.local                        # Updated with FCM environment variables:
│                                     # - NEXT_PUBLIC_FIREBASE_API_KEY
│                                     # - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
│                                     # - NEXT_PUBLIC_FIREBASE_PROJECT_ID
│                                     # - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
│                                     # - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
│                                     # - NEXT_PUBLIC_FIREBASE_APP_ID
│                                     # - NEXT_PUBLIC_FIREBASE_VAPID_KEY
│                                     # - FIREBASE_CLIENT_EMAIL
│                                     # - FIREBASE_PRIVATE_KEY
│                                     # - EMAIL_* configuration
│                                     # - SITE_URL
├── .eslintrc.json
├── .gitignore
├── eslint.config.mjs
├── next.config.js
├── next.config.ts
├── next-env.d.ts
├── package.json                      # Updated with FCM dependencies:
│                                     # - firebase
│                                     # - firebase-admin
├── postcss.config.mjs
├── README.md
├── project_structure.md              # This file (moved from public/documents/)
└── tsconfig.json

# Database Schema Updates:
# - resumeRequests collection now includes 'category' field (string)
#   - Values: 'resume', 'free_item', 'portfolio', etc.
#   - Default: 'resume' for backward compatibility
#
# - Each request document structure:
#   {
#     name: string,
#     email: string,
#     company: string,
#     message: string,
#     reason: string,
#     category: string,
#     status: 'pending' | 'approved' | 'denied' | 'used' | 'expired',
#     timestamp: timestamp,
#     passcode: string (when approved)
#   }
