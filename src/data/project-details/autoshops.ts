import type { ProjectDetail } from './types';

export const autoshopsDetail: ProjectDetail = {
  id: 'autoshops',
  tagline:
    'Lead Developer on a B2B2C auto repair marketplace — modernization, admin ops, and Google Maps at scale.',
  overview:
    'Autoshops.com connects car owners with vetted repair shops through a two-sided marketplace. As Lead Developer with CTO Adam Spivak, Jim led platform modernization from legacy Hostinger/MySQL toward Vercel serverless, Firebase Auth, Stripe subscriptions, and a full admin operations dashboard — reducing manual shop processing by roughly 80%.',
  architecture: [
    {
      title: 'Platform stack',
      items: [
        'Next.js frontend and serverless API on Vercel',
        'Firebase Authentication (email/password + Google OAuth)',
        'MySQL — Google Cloud SQL migration path toward AWS RDS',
        'Stripe Checkout, webhooks, idempotency, à la carte addons',
      ],
    },
    {
      title: 'Admin operations',
      items: [
        '4-level RBAC: Super Admin through Viewer',
        'Shop approval workflows with ~100-point confidence scoring',
        'Automated approve/reject/suspend emails',
        'Subscription admin — view, cancel, reconcile race conditions',
      ],
    },
    {
      title: 'Google Maps Platform',
      items: [
        'Geocoding API for shop and customer addresses',
        'Places API — Place Details, Text Search, Nearby Search',
        'Maps JavaScript API and @vis.gl/react-google-maps markers',
        'Shop onboarding with name + ZIP discovery',
      ],
    },
    {
      title: 'Marketplace features',
      items: [
        'Owner service requests and mechanic bidding UX',
        'Registration with email verification and reCAPTCHA v3',
        'Shop claim flow and Google Reviews / Place ID integration',
        'Free / Pro / Elite subscription tiers for shops',
      ],
    },
    {
      title: 'CI/CD & quality (designed)',
      items: [
        '7-wave pipeline: Playwright E2E, GitHub Actions on Vercel previews',
        'Jira GitHub-Integration paired branches',
        'Supabase branch DBs per feature PR',
        'Production approval gate before promote',
      ],
    },
  ],
  shipped: [
    '482-line technical infrastructure and security analysis document',
    'Phase 3 Vercel + Firebase Auth migration architecture and git branching strategy',
    'Admin dashboard rebuild with shop approval and confidence scoring',
    'Stripe subscription fixes — optimistic UI, polling, webhook reconciliation',
    'Google Maps integration across geocode, Places, and map UI',
    'Registration, email verification, and bidding UX improvements',
  ],
  distinctFrom:
    'Collaborative engagement — CTO Adam Spivak and part-time dev team. Distinguish designed vs deployed-to-production features when citing dates; many capabilities landed on TEST ahead of prod.',
  repoNote: 'Source: Autoshop — documentation/JIM_RESUME_CONTEXT_AUTOSHOPS.md.',
};
