lowrys-website/
├── public/
│   ├── documents/
│   │   └── jim-lowry-resume.pdf
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
│   │   │   └── page.tsx               # Updated to support both messages and resume requests
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
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── MobileNavigation.tsx
│   │   ├── Navigation.tsx
│   │   ├── ResumeAccess.tsx          # Updated to work with FCM instead of Twilio
│   │   └── SocialLinks.tsx
│   └── lib/
│       ├── firebase-admin.js         # Server-side Firebase Admin SDK initialization
│       ├── firebase-client.ts        # Client-side Firebase config for FCM with TypeScript
│       └── resumeAccessUtils.js      # Updated to use FCM instead of Twilio
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
