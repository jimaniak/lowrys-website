import type { ProjectDetail } from './types';

export const pmWorkaideDetail: ProjectDetail = {
  id: 'pm-workaide',
  tagline:
    'Enterprise project management SaaS with multi-persona Claude assistance and user-controlled AI costs.',
  overview:
    'PM.WorkAide.ai is a separate WorkAide product from jobs.workaide.ai — a project management platform with 22-table Supabase schema, RLS, and Vercel AI SDK integration. Three Anthropic Claude personas (Super PM, Tech SME, Governance SME) assist with portfolio governance, technical decisions, and PMO workflows.',
  architecture: [
    {
      title: 'Application stack',
      items: [
        'Next.js 14 App Router, React 18, TypeScript, Tailwind',
        'Supabase PostgreSQL — 22 tables with Row Level Security',
        'Vercel deployment with custom domain pm.workaide.ai',
        'Supabase SSR middleware and session persistence',
      ],
    },
    {
      title: 'AI personas',
      items: [
        'Vercel AI SDK (ai package) with Anthropic Claude',
        'Super PM — portfolio and delivery guidance',
        'Tech SME — architecture and implementation advice',
        'Governance SME — compliance and process rigor',
        'User-provided API keys for cost control',
      ],
    },
    {
      title: 'Core PM features',
      items: [
        'Organizations, projects, and task CRUD',
        'Dashboard with hamburger “New” creation flows',
        'Inline organization creation from project modal',
        'Mobile-responsive layout',
      ],
    },
    {
      title: 'Auth & trials',
      items: [
        'Email verification system',
        '3-day trial with 50-message AI limit',
        'Multi-environment setup (prod + dev Supabase projects)',
        'Supabase CLI migrations for schema version control',
      ],
    },
  ],
  shipped: [
    'Live platform at pm.workaide.ai with custom domain',
    'User authentication, session persistence, and logout flows',
    'Project creation UI with organization management',
    '22-table database schema with RLS policies',
    'Three Claude personas wired through Vercel AI SDK',
    'Trial system and email verification',
    'Mobile-responsive dashboard shell',
  ],
  distinctFrom:
    'PM.WorkAide.ai (project management) and WorkAide Jobs (job search) are different codebases under the WorkAide brand. WorkAide Central handles shared auth/billing — not a separate employer.',
  repoNote: 'Source: WorkAide/workaide-pm — README.md, DATABASE-SCHEMA-FINAL.md, PM-Project-Master-Plan.md.',
};
