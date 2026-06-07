import type { ProjectDetail } from './types';

export const lowrysAnalyticsDetail: ProjectDetail = {
  id: 'lowrys-analytics',
  tagline:
    'This portfolio site — workforce analytics, BLS wage tooling, and gated resume access for recruiters.',
  overview:
    'Lowrys.org is both Jim’s professional portfolio and a demonstration of data engineering chops. Beyond the 2026 recruiter refresh, the site hosts predictive attrition modeling, a rate calculator over 50,000+ BLS occupation records, interactive Chart.js and React-Globe.gl visualizations, and a gated resume request flow with admin approval.',
  architecture: [
    {
      title: 'Portfolio & content',
      items: [
        'Next.js 15 App Router, TypeScript, Tailwind CSS',
        'Shared portfolio data layer (src/data/portfolio.ts)',
        'Tiered projects page with case study detail routes',
        'Option C split — recruiter hub with ezweb.work footer link only',
      ],
    },
    {
      title: 'Analytics demos',
      items: [
        'Attrition forecast modeling with Chart.js visualizations',
        'Rate calculator — BLS wage data API routes',
        '50,000+ occupation records with automated ETL pipelines',
        'React-Globe.gl geographic workforce views',
      ],
    },
    {
      title: 'Data layer',
      items: [
        'Turso / LibSQL for occupation and analytics data',
        'API routes for BLS wage lookup and occupation search',
        'ETL scripts with 99%+ accuracy validation',
      ],
    },
    {
      title: 'Resume access gate',
      items: [
        'Request → admin approve/deny → passcode → download flow',
        'Supabase-backed resume request tracking',
        'No public email/phone on contact — recruiter-safe funnel',
      ],
    },
  ],
  shipped: [
    '2026 portfolio refresh — AI-Native Product Engineer positioning',
    'Production portfolio with project screenshots and case studies',
    'BLS rate calculator and attrition forecast demos',
    'Gated resume access with passcode modal and admin workflow',
    'Cloudflare Turnstile on contact form',
    'Mobile-first navigation and responsive project cards',
  ],
  distinctFrom:
    'This repository (lowrys-website) powers lowrys.org. Analytics demos coexist with the employment-focused portfolio — not a separate product URL.',
  repoNote: 'Source: lowrys-website (this repo) — src/app/rate-calculator, attrition-forecast, api/request-resume-access.',
};
