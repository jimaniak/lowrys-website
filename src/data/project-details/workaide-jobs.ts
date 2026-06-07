import type { ProjectDetail } from './types';

export const workaideJobsDetail: ProjectDetail = {
  id: 'workaide-jobs',
  tagline: 'AI job-search workspace — collect, score, tailor, and export in one production SaaS.',
  overview:
    'WorkAide Jobs is a solo-built B2C SaaS at jobs.workaide.ai. It unifies listings from multiple job boards into one inbox, scores fit against your resume, generates tailored application drafts, and exports styled PDF resumes — with Stripe Pro billing, admin analytics, and Cloudflare Turnstile on auth flows.',
  velocity:
    'Concept → Vercel production deploy with Stripe checkout, admin console, and Facebook launch promo (MAYFB50) in ~48 hours (May 16–17, 2026). Founder-operated in production — Jim uses the product daily for his own job search, not demo-only shelfware.',
  architecture: [
    {
      title: 'Frontend',
      items: ['Next.js 16 App Router', 'React 19', 'TypeScript', 'Tailwind CSS', 'Server & client components'],
    },
    {
      title: 'Backend & data',
      items: [
        'Supabase PostgreSQL with RLS',
        'Supabase Auth (password + OAuth)',
        'Vercel serverless API routes',
        'Cron-based job collection',
      ],
    },
    {
      title: 'AI & matching',
      items: [
        'OpenAI for match scoring and application drafts',
        'Resume-aware context from Settings (career corpus sync)',
        'Manual score override per job',
        'ATS alignment fields for keyword matching',
        'Resume fidelity guardrails on tailored output',
      ],
    },
    {
      title: 'Job ingestion',
      items: [
        'JSearch, Findwork, Adzuna, USAJOBS, RSS',
        'Arbeitnow and Remotive in codebase',
        'Saved searches, deduplication, inbox filters',
        'Usage limits by Free vs Pro plan tier',
      ],
    },
    {
      title: 'Resume output',
      items: [
        'Template registry (Classic, Modern, Minimalist, Corporate)',
        'Live HTML preview and style comparison gallery',
        'Puppeteer + Chromium PDF export on Vercel',
        'Print-to-PDF fallback',
        '1-page vs 2-page resume length options',
      ],
    },
    {
      title: 'Billing & ops',
      items: [
        'Stripe Checkout, Customer Portal, webhooks',
        'Free vs Pro plan enforcement',
        'Admin-managed pricing and promo codes',
        'User/login analytics dashboard',
        'Cloudflare Turnstile on auth flows',
      ],
    },
  ],
  shipped: [
    'Multi-board job collector with saved searches and deduplicated inbox',
    'AI match scoring with manual override and missing-skills breakdown',
    'Per-job application drafts (resume + cover letter) with regenerate flows',
    'Styled resume PDF/HTML export via Puppeteer on Vercel',
    'Stripe Pro subscriptions with admin pricing and promotion codes',
    'Admin analytics: signups, logins, plan breakdown, active users (7d)',
    'Facebook GTM launch with limited-time promo code campaign',
  ],
  distinctFrom:
    'WorkAide Jobs (jobs.workaide.ai) is a separate codebase from PM.WorkAide.ai (pm.workaide.ai). WorkAide Central handles shared brand auth/billing — not a second employer on resumes.',
  repoNote: 'Source: Resumes/app — docs in Resumes/app/docs/ (Stripe, admin, job APIs).',
};
