# Lowrys Website Project Structure

## Overview
This is a Next.js 14 application with TypeScript, integrating with Turso database for BLS wage data and predictive analytics features.

## Root Directory
```
lowrys-website/
├── .env.example                        # Example environment variables
├── .env.local                          # Environment variables (Turso, Firebase, etc.)
├── .eslintrc.json                      # ESLint configuration
├── .firebaserc                         # Firebase project configuration
├── .gitignore                          # Git ignore patterns
├── check-pest-entries.mjs              # Data validation script
├── database-normalization-progress.md  # Database cleanup & normalization progress
├── database-normalization-progress.pdf # Database cleanup & normalization progress (PDF)
├── export-to-excel.js                  # Legacy export utility
├── firebase.json                       # Firebase hosting configuration
├── hierarchy-mismatches.txt            # Data analysis output
├── lowrys-database-export-2025-06-19.xlsx # Database export
├── next.config.js                      # Next.js configuration (legacy)
├── next.config.mjs                     # Next.js configuration (current)
├── next.config.ts                      # Next.js TypeScript config
├── next-env.d.ts                       # Next.js TypeScript definitions
├── package.json                        # Dependencies and scripts
├── package-lock.json                   # Dependency lock file
├── postcss.config.mjs                  # PostCSS configuration
├── project_structure.md                # This file
├── README.md                           # Project documentation
├── tailwind.config.js                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript configuration
├── update-disasters.ps1                # PowerShell data update script
├── update-disasters.sh                 # Bash data update script
└── user-mapped-hierarchy.csv           # User mapping data
```

## Source Code Structure (`src/`)
```
src/
├── app/                           # Next.js 14 App Router
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Homepage
│   │
│   ├── about/                    # About page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── admin/                    # Admin dashboard
│   │   └── page.tsx
│   │
│   ├── api/                      # API Routes
│   │   ├── approve-resume-request/  # Resume approval endpoint
│   │   │   └── route.js
│   │   ├── bls-wage/            # BLS wage data endpoint
│   │   │   └── route.ts
│   │   ├── deny-resume-request/ # Resume denial endpoint
│   │   │   └── route.js
│   │   ├── download-resume/     # Resume download endpoint
│   │   │   └── route.js
│   │   ├── industry-groups/     # BLS industry group search
│   │   │   └── route.ts
│   │   ├── rate-calculator/     # Rate calculator data endpoints
│   │   │   ├── route.ts         # Main endpoint
│   │   │   ├── route.ts.modal-api-complete  # Backup versions
│   │   │   ├── route.ts.reconfigured-database-brokesomething
│   │   │   └── health/          # Health check endpoint
│   │   │       └── route.ts
│   │   ├── rate-calculator-enhanced/ # Enhanced rate calculator
│   │   │   └── route.ts
│   │   ├── rate-calculator-old/ # Legacy rate calculator
│   │   │   └── route.ts
│   │   ├── request-resume-access/ # Resume access request endpoint
│   │   │   └── route.js
│   │   ├── search-occupations/  # Occupation search for SEO forms
│   │   │   └── route.ts
│   │   ├── seo-intake/          # SEO intake form submission
│   │   │   ├── route.ts
│   │   │   ├── add-industry-column.sql
│   │   │   └── schema.sql
│   │   └── validate-passcode/   # Passcode validation endpoint
│   │       └── route.js
│   │
│   ├── attrition-forecast/       # Predictive analytics feature
│   │   └── page.tsx
│   │
│   ├── contact/                  # Contact page
│   │   └── page.tsx
│   │
│   ├── demo/                     # Demo pages
│   │   ├── metadata.ts
│   │   └── page.tsx
│   │
│   ├── my-checklist/             # Personal checklist feature
│   │   └── page.tsx
│   │
│   ├── predictive-analytics-landing/  # Predictive analytics landing
│   │   └── page.tsx
│   │
│   ├── predictive-analytics-model-attribution/  # Model attribution
│   │   └── page.tsx
│   │
│   ├── projects/                 # Projects showcase
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── rate-calculator/          # Rate Calculator Feature
│   │   ├── page.tsx             # Main rate calculator page
│   │   ├── page.tsx.detailed-groups-working    # Backup versions
│   │   ├── page.tsx.major-groups-working
│   │   ├── page.tsx.minor-groups-working
│   │   ├── page.tsx.modal-ui-complete
│   │   └── page.tsx.pre-enhanced-modal
│   │
│   ├── rate-calculator-enhanced/ # Enhanced rate calculator
│   │   └── page.tsx
│   │
│   ├── resources/                # Resources page
│   │   └── page.tsx
│   │
│   ├── seo-intake-form/          # SEO Intake Form Feature
│   │   ├── page.tsx             # Form landing page
│   │   ├── page-fixed.tsx       # Fixed version
│   │   ├── page-landing.tsx     # Landing version
│   │   ├── types.ts             # TypeScript types
│   │   ├── general/             # General info form step
│   │   │   ├── page.tsx
│   │   │   └── GeneralForm.tsx
│   │   └── pest-control/        # Pest control specific form
│   │       └── page.tsx
│   │
│   └── skills/                   # Skills showcase
│       └── page.tsx
│
├── components/                    # Reusable React components
│   ├── AdminNotifications.tsx
│   ├── ContactFormMessage.tsx
│   ├── Header.tsx
│   ├── Layout.tsx
│   ├── MobileNavigation.tsx
│   ├── Navigation.tsx
│   ├── PendingRequestsTable.tsx
│   ├── RateCalculatorTurbo.tsx
│   ├── ResumeAccessButton.tsx
│   ├── ResumeAccessContext.tsx
│   ├── ResumeAccessModal.tsx
│   ├── ResumeAccess-TBDeleted.jsx
│   └── SocialLinks.tsx
│
├── firebase/                      # Firebase configuration
│   └── config.ts
│
├── hooks/                         # Custom React hooks
│   └── useFormValidation.ts
│
└── lib/                          # Utility libraries
    ├── database.ts               # Turso database connection
    ├── firebase-admin.js         # Firebase admin SDK
    ├── firebase-client.ts        # Firebase client SDK
    └── resumeAccessUtils.js      # Resume access utilities
```

## Scripts Directory (`scripts/`)
```
scripts/
├── add-column.js                      # Database column addition utility
├── add-columns-to-occupations.js     # Add columns to occupations table
├── add-hierarchy-parent-column.js    # Add hierarchy parent column
├── add-industry-column.js            # Add industry column
├── add-industry-column-update.js     # Update industry column
├── add-missing-column.js             # Add missing columns utility
├── add-missing-columns.js            # Add multiple missing columns
├── add-occupations-columns.js        # Add columns to occupations
├── add-occupation-type-column.js     # Add occupation type column
├── analyze-database-tables.js        # Analyze database tables structure
├── analyze-tables-phase1.js          # Phase 1: Analyze specialized tables
├── audit-bls-tables.js               # Audit BLS tables
├── bls-config.js                     # BLS configuration
├── bls-normalization-phase2.js       # Phase 2: BLS table normalization analysis
├── bls-tables-normalization.js       # BLS tables normalization
├── check-and-fix-columns.js          # Check and fix columns
├── check-bls-categories.js           # Check BLS categories
├── check-category-samples.js         # Check category samples
├── check-columns.js                  # Check columns utility
├── check-schema.js                   # Schema validation
├── cleanup-database.js               # Database cleanup automation
├── complete-database-normalization.js # Complete database normalization
├── database-cleanup.js               # Database cleanup
├── database-cleanup-backup.json     # Backup metadata from cleanup
├── database-table-analysis-report.md # Database table analysis report
├── discover-bls-files.js             # Discover BLS files
├── drop-unused-tables.js             # Drop unused tables
├── drop-year-columns.js              # Drop year columns
├── enhanced-bls-automation-v2.js     # Enhanced BLS automation v2
├── enhanced-sunday-night-automation.js # Enhanced BLS automation script
├── examine-workbook-index.js         # Examine workbook index
├── find-other-category.js            # Find other category
├── flatten-bls.js                    # Flatten BLS data
├── inspect-occupation-data.js        # Inspect occupation data
├── list-views.js                     # List database views
├── migrate-all-bls-tables.js         # Migrate all BLS tables
├── migrate-bls-data-fixed.js         # Migrate BLS data (fixed)
├── migrate-complete-bls.js           # Migrate complete BLS
├── migrate-complete-data.js          # Migrate complete data
├── migrate-complete-data-fixed.js    # Migrate complete data (fixed)
├── migrate-complete-data-turso.js    # Migrate complete data to Turso
├── migrate-projections.js            # Migrate projections
├── migrate-schema.js                 # Migrate schema
├── migrate-to-turso.js               # Migrate to Turso
├── migrate-year-flexible.js          # Migrate year flexible
├── normalize-bls-tables.js           # Normalize BLS tables
├── phase2-cleanup-empty-tables.js    # Phase 2: Remove empty BLS tables
├── populate-categories.js            # Populate categories
├── populate-category-column.js       # Populate category column
├── print-category-summary.sh         # Print category summary (shell script)
├── print-detailed-samples.js         # Print detailed samples
├── process-occupation-data.js        # Process occupation data
├── process-occupation-data-flexible.js # Process occupation data (flexible)
├── process-occupation-data-raw.js    # Process occupation data (raw)
├── remove-all-views.js               # Remove all views
├── run-schema.js                     # Run schema
├── setup-occupation-hierarchy.js    # Setup occupation hierarchy
├── setup-seo-intake-table.js        # Setup SEO intake table
├── simple-database-cleanup.js       # Simple database cleanup
├── sunday-night-bls-automation.js   # Sunday night BLS automation
├── table-analysis-phase1.json       # Phase 1 table analysis results
├── update-bls-benchmarks.js          # Update BLS benchmarks
├── update-bls-to-turso.js            # Update BLS to Turso
├── update-hierarchy-3-levels.js     # Update hierarchy 3 levels
├── upsert-example.js                 # Upsert example
└── verify-database-state.js         # Verify current database state
```

## Public Assets (`public/`)
```
public/
├── data/                         # Data files
│   ├── bls-benchmarks.json      # BLS benchmarks data
│   ├── bls-benchmarks-flat.csv  # Flat BLS benchmarks
│   ├── bls-benchmarks-hierarchical.json # Hierarchical BLS benchmarks
│   ├── bls-benchmarks-hierarchical-with-projections.json # With projections
│   ├── bls-projections.xlsx     # BLS projections spreadsheet
│   ├── disasters.csv            # Disaster data
│   ├── occupation.xlsx          # Occupation data
│   ├── occupations.db           # Occupations database
│   └── regions.geojson          # Geographic regions data
│
├── documents/                    # Document files
│   ├── business-case-blog-analytics-platform.md # Business case document
│   ├── business-case-blog-analytics-platform.txt # Business case text
│   ├── business-process-health-assessment.xlsx # Process assessment
│   ├── jim-lowry-resume.pdf     # Resume PDF
│   ├── owner-automation-quick-reference.md # Automation guide
│   ├── predictive-analytics-business-case-summary.pdf # Analytics case
│   ├── predictive-analytics-business-case-summary.txt # Analytics case text
│   ├── predictive-analytics-linkedin-post-template.md # LinkedIn template
│   └── predictive-analytics-model-attribution.md # Model attribution
│
├── favicon/                      # Favicon files
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   └── site.webmanifest
│
├── images/                       # Image assets
│   ├── jim-lowry-profile.jpg    # Profile image
│   └── projects/                # Project images
│       ├── technical-infrastructure/
│       │   ├── GarageTransformationJourney.png
│       │   ├── HomeAutomation.png
│       │   ├── LaundryRoomTransformation.gif
│       │   └── NetworkTraffic.gif
│       └── web-development/
│           └── airtisan-platform.png
│
├── firebase-messaging-sw.js     # Firebase messaging service worker
├── file.svg                     # File icon
├── globe.svg                    # Globe icon
├── logo.svg                     # Logo
├── manifest.json                # Web app manifest
├── next.svg                     # Next.js logo
├── vercel.svg                   # Vercel logo
└── window.svg                   # Window icon
```

## Database Files (`db/`)
```
db/
├── bls-categories-schema.sql    # BLS categories schema
├── bls-data.db                  # BLS data database
├── schema.sql                   # Main database schema
├── schema-extended.sql          # Extended schema
└── schema-year-flexible.sql     # Year-flexible schema
```

## Build & Deployment Files
```
├── .github/                     # GitHub Actions workflows
│   └── workflows/
│       ├── test-secret.yml      # Test secret workflow
│       ├── update-bls.yml       # Update BLS data workflow
│       ├── update-bls-enhanced.yml # Enhanced BLS update workflow
│       └── update-bls-turso.yml # Update BLS to Turso workflow
│
├── .vercel/                     # Vercel deployment configuration
│   ├── project.json
│   └── README.txt
│
├── functions/                   # Firebase Cloud Functions
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
└── resume-emails/               # Resume email service
    ├── .gitignore
    ├── index.js
    ├── package.json
    └── package-lock.json
```

## Database Schema (Turso SQLite)
```
Current Tables (5 total - cleaned and normalized):
├── occupations              # Main occupation data with hierarchy (active)
├── projections             # BLS employment projections 2023-2033 (active)  
├── occupation_data         # Additional occupation metadata (active)
├── bls_special_tables      # Special BLS table metadata (active)
├── seo_intake_forms        # SEO intake form submissions (active)
└── sqlite_sequence         # SQLite auto-increment tracking (system)

Removed Tables (Phase 1 & 2 Cleanup):
├── bls_data_versions       # Metadata table (Phase 1)
└── bls_table_1_*          # 11 empty BLS workbook tables (Phase 2)
    ├── bls_table_1_1, bls_table_1_2, bls_table_1_3, bls_table_1_4
    ├── bls_table_1_5, bls_table_1_6, bls_table_1_8, bls_table_1_9
    └── bls_table_1_10, bls_table_1_11, bls_table_1_12
```

**Database Status**: ✅ Fully normalized and cleaned
- All remaining tables are actively used by API endpoints
- No duplicate or legacy data structures
- Normalized schema with proper foreign key relationships
- Regular backups and documentation maintained

## Key Features

### 1. Rate Calculator
- **Location**: `/rate-calculator`
- **Purpose**: Calculate consulting daily rates based on BLS wage data
- **Features**: 
  - Hierarchical occupation selection (Major → Minor → Detailed → Occupation)
  - State-based wage data
  - Employee vs. Consulting rate comparison
  - BLS employment projections display

### 2. SEO Intake Form
- **Location**: `/seo-intake-form`
- **Purpose**: Collect client information for SEO services
- **Features**:
  - Multi-step form with validation
  - Industry autocomplete using BLS data
  - Turso database storage
## Key Features

### 1. Rate Calculator
- **Location**: `/rate-calculator`
- **Purpose**: Calculate consulting daily rates based on BLS wage data
- **Features**: 
  - Hierarchical occupation selection (Major → Minor → Detailed → Occupation)
  - State-based wage data
  - Employee vs. Consulting rate comparison
  - BLS employment projections display

### 2. SEO Intake Form
- **Location**: `/seo-intake-form`
- **Purpose**: Collect client information for SEO services
- **Features**:
  - Multi-step form with validation
  - Industry autocomplete using BLS data
  - Turso database storage

### 3. Predictive Analytics
- **Location**: `/predictive-analytics-landing`, `/attrition-forecast`
- **Purpose**: Demonstrate predictive modeling capabilities
- **Features**:
  - Attrition forecasting models
  - Model attribution analysis
  - Business case documentation

### 4. BLS Data Integration
- **Automation**: GitHub Actions workflows for data updates
- **Sources**: BLS OEWS data and Employment Projections workbook
- **Storage**: Normalized in Turso database with hierarchical structure

## Environment Variables
```
# Turso Database
TURSO_DATABASE_URL=libsql://[database-url]
TURSO_AUTH_TOKEN=[auth-token]

# Firebase (for auth/notifications)
NEXT_PUBLIC_FIREBASE_*=[firebase-config]

# BLS API
NEXT_PUBLIC_BLS_API_KEY=[api-key]
BLS_URL=[data-source-url]

# Email Configuration
EMAIL_HOST=smtp.office365.com
EMAIL_USER=[email]
EMAIL_PASSWORD=[password]
```

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## API Endpoints

### Rate Calculator API (`/api/rate-calculator`)
- `?action=major-groups` - Get major occupation groups
- `?action=occupations-by-major&majorCode=XX` - Get occupations by major group
- `?action=regions&occupation=XX-XXXX` - Get available regions for occupation
- `?action=wage-data&occupation=XX-XXXX&region=XX` - Get wage data

### BLS Wage API (`/api/bls-wage`)
- BLS wage data retrieval endpoint

### SEO Intake API (`/api/seo-intake`)
- `POST` - Submit SEO intake form data

### Industry Search API (`/api/search-occupations`)
- `?query=search-term` - Search occupations for forms

### Industry Groups API (`/api/industry-groups`)
- Get BLS industry group data

### Resume Access APIs
- `/api/request-resume-access` - `POST` - Request access to resume
- `/api/approve-resume-request` - `POST` - Approve resume access request  
- `/api/deny-resume-request` - `POST` - Deny resume access request
- `/api/download-resume` - `GET` - Download resume PDF
- `/api/validate-passcode` - `POST` - Validate access passcode

## Deployment
- **Platform**: Vercel
- **Database**: Turso (remote SQLite)
- **Domain**: lowrys.org
- **Auto-deployment**: Connected to main branch
- **Hosting**: Firebase (static files)

## Data Sources & Processing
- **BLS OEWS**: Occupational Employment and Wage Statistics
- **BLS Projections**: Employment projections 2023-2033
- **Automated Updates**: GitHub Actions workflows
- **Data Processing**: Multiple normalization and migration scripts
- **Export Capabilities**: Excel export functionality

## Next Steps (Database Normalization)
1. ✅ File cleanup and organization
2. 🔄 Table analysis and documentation  
3. 🔄 BLS table normalization
4. 🔄 Automation script updates
5. 🔄 Validation and testing

---
*Last Updated: June 27, 2025*