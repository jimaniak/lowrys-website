lowrys-website/
├── public/
│   ├── documents/
│   │   └── jim-lowry-resume.pdf
│   │   ├── project_structure.md
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
│   ├── firebase-messaging-sw.js      # FCM service worker (required in public directory)
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
│   │   ├── admin/                    # New admin area for FCM notifications
│   │   │   └── page.tsx              # React-based admin interface
│   │   ├── api/
│   │   │   ├── approve-resume-request/    # API endpoint for FCM approval
│   │   │   │   └── route.js
│   │   │   ├── deny-resume-request/       # API endpoint for FCM denial
│   │   │   │   └── route.js
│   │   │   ├── request-resume-access/
│   │   │   │   └── route.js
│   │   │   ├── twilio-webhook/
│   │   │   │   └── route.js               # Can be kept for future use
│   │   │   └── validate-passcode/
│   │   │       └── route.js
│   │   ├── contact/
│   │   │   └── page.tsx
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
│   │   ├── AdminNotifications.jsx    # New React component for FCM notifications
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── MobileNavigation.tsx
│   │   ├── Navigation.tsx
│   │   ├── ResumeAccess.jsx
│   │   └── SocialLinks.tsx
│   └── lib/
│       ├── firebase-admin.js         # Server-side Firebase admin SDK
│       ├── firebase-client.js        # New client-side Firebase config for FCM
│       └── resumeAccessUtils.js      # Modified to use FCM instead of Twilio
├── .env.local                        # Updated with FCM environment variables:
│                                     # - NEXT_PUBLIC_FIREBASE_API_KEY
│                                     # - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
│                                     # - NEXT_PUBLIC_FIREBASE_PROJECT_ID
│                                     # - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
│                                     # - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
│                                     # - NEXT_PUBLIC_FIREBASE_APP_ID
│                                     # - NEXT_PUBLIC_FIREBASE_VAPID_KEY
├── .eslintrc.json
├── .gitignore
├── eslint.config.mjs
├── next.config.js
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package.json                      # Updated with FCM dependencies:
│                                     # - firebase
├── postcss.config.mjs
├── README.md
└── tsconfig.json