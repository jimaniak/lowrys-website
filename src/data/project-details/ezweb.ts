import type { ProjectDetail } from './types';

export const ezwebDetail: ProjectDetail = {
  id: 'ezweb',
  tagline:
    'Agency operations platform with multi-model AI router, agentic SEO/blog pipeline, and client delivery under EZ Web LLC.',
  overview:
    'EZWeb.work is the public face and internal ops hub for EZ Web LLC — affordable web and AI services for SMBs. Next.js 15 on Vercel with 30+ Supabase tables powers customers, projects, invoices, team assignments, and production agentic workflows: multi-agent blog/SEO pipelines, project-scoped admin agents, and a homepage qualification chatbot.',
  architecture: [
    {
      title: 'Core platform',
      items: [
        'Next.js 15 App Router, TypeScript, Tailwind CSS',
        'Supabase PostgreSQL — 30+ tables with RLS',
        'Vercel deployment (dev → test → production workflow)',
        'Customers, projects, estimates, invoices, revenue splits',
      ],
    },
    {
      title: 'Multi-model AI router',
      items: [
        'Task-based routing to Claude Opus, GPT-5.2, Gemini 2.0 Flash',
        'model-router.ts with admin model selector and fallbacks',
        'Usage and cost logging per conversation',
      ],
    },
    {
      title: 'Agentic content pipelines',
      items: [
        'SEO/blog chain: Intern → Researcher → Writer → Editor → human publish',
        'Tavily-backed research and topic ideation',
        'Ziggy Ryan persona for social copy with editorial review',
        'Service-area landing pages for geo SEO',
      ],
    },
    {
      title: 'Admin & sales AI',
      items: [
        'Project-scoped assistant with document iteration protocol',
        'Homepage chatbot (Ez) for qualification and lead capture',
        'Document ingest: PDF, DOCX, XLSX via mammoth/pdf-parse',
        'Finalize-to-PDF/DOCX to Supabase project-documents storage',
      ],
    },
    {
      title: 'Integrations',
      items: [
        'Stripe invoicing and payment links',
        'Resend transactional email',
        'Cloudflare Turnstile, Runway/image providers for blog heroes',
        'Puppeteer website audits, Microsoft Clarity analytics',
      ],
    },
    {
      title: 'Client delivery',
      items: [
        'CT Home Remodel and other SMB sites delivered from this platform',
        'Portfolio and brand references on ezweb.work',
      ],
    },
  ],
  shipped: [
    'Public marketing site with blog and legal pages',
    'Admin back office for customers, projects, and billing',
    'Multi-model router with three LLM providers in production',
    'Multi-agent SEO/blog pipeline with human-in-the-loop publish',
    'Homepage qualification chatbot with brand guardrails',
    'Project-scoped admin AI with document finalize flows',
    'Stripe invoice creation and payment status tracking',
  ],
  distinctFrom:
    'EZWeb.work (Supabase/Next.js agency platform) is separate from EZ Voice (NestJS/Prisma/Vapi flagship). Both are EZ Web LLC products with different codebases and deploy paths.',
  repoNote: 'Source: EZWeb — docs/DATABASE-SCHEMA.md, Workflow Overview.md, Blog-Pipeline-Agent-Identities.md.',
};
