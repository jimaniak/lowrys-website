lowrys-website/
├── public/
│   ├── documents/
│   │   ├── jim-lowry-resume.pdf
│   │   └── business-process-health-assessment.xlsx
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
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── approve-resume-request/
│   │   │   │   └── route.js
│   │   │   ├── deny-resume-request/
│   │   │   │   └── route.js
│   │   │   ├── request-resume-access/
│   │   │   │   └── route.js
│   │   │   └── validate-passcode/
│   │   │       └── route.js
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── resources/
│   │   │   └── page.tsx
│   │   ├── skills/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AdminNotifications.tsx
│   │   ├── ContactFormMessage.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── MobileNavigation.tsx
│   │   ├── Navigation.tsx
│   │   ├── PendingRequestsTable.tsx
│   │   ├── ResumeAccess-TBDeleted.jsx
│   │   ├── ResumeAccessButton.tsx
│   │   ├── ResumeAccessContext.tsx
│   │   ├── ResumeAccessModal.tsx
│   │   └── SocialLinks.tsx
│   ├── firebase/
│   │   └── config.ts
│   ├── hooks/
│   │   └── useFormValidation.ts
│   └── lib/
│       ├── firebase-admin.js
│       ├── firebase-client.ts
│       └── resumeAccessUtils.js
├── functions/
│   ├── index.js
│   └── package.json
├── resume-emails/
│   ├── index.js
│   └── package.json
├── docs/
│   └── category_testing_guide.md
├── .env.local
├── .eslintrc.json
├── .gitignore
├── eslint.config.mjs
├── next.config.mjs
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── project_structure.md
├── README.md
├── tailwind.config.js
├── tsconfig.json
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
