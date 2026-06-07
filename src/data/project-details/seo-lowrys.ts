import type { ProjectDetail } from './types';

export const seoLowrysDetail: ProjectDetail = {
  id: 'seo-lowrys',
  tagline:
    'Enterprise multi-agent SEO platform — MCP bridge, n8n orchestration, and KMS-encrypted business intelligence.',
  overview:
    'SEO.Lowrys.org is a solo-built strategic SEO and business intelligence platform. Five coordinated AI agents run through n8n workflows with a Vercel MCP bridge at /api/mcp/. Turso/LibSQL stores client data; Google Cloud KMS encrypts 65+ BI fields. Integrations include DataForSEO, Google Analytics 4, and Search Console.',
  architecture: [
    {
      title: 'Frontend & hosting',
      items: [
        'Next.js 14 full-stack React with TypeScript',
        'Vercel edge hosting with MCP bridge (mcp-handler)',
        'Firebase Authentication',
        'Professional dual-theme UI — user portal and admin dashboard',
      ],
    },
    {
      title: 'AI agent architecture',
      items: [
        '5 specialized BI agents with coordinated MCP workflows',
        'n8n workflow automation for agent orchestration',
        'mcp-handler serverless bridge for cross-agent communication',
        'Autonomous competitive analysis and recommendation generation',
      ],
    },
    {
      title: 'Data & security',
      items: [
        'Turso / LibSQL primary database',
        'Google Cloud KMS AEAD on 65+ sensitive BI fields',
        'NIST-aligned encryption across API endpoints',
        'Hierarchical KPI system and action-item tracking',
      ],
    },
    {
      title: 'SEO integrations',
      items: [
        'DataForSEO professional intelligence APIs',
        'Google Analytics 4 and Search Console pipelines',
        'Commercial pricing tiers for autonomous SEO optimization',
        'Multi-agent modal system for business intake',
      ],
    },
  ],
  shipped: [
    'Production MCP bridge at /api/mcp/ on Vercel',
    '5-agent coordinated architecture with n8n orchestration',
    'KMS migration for enterprise-grade field encryption',
    'Turso/LibSQL with stable connection fallback system',
    'Admin dashboard with team management and visual selection UX',
    'Authentication and email verification with production security hardening',
  ],
  distinctFrom:
    '100% solo project — distinct from EZWeb.work agency blog pipeline and from Lowrys.org workforce analytics on this portfolio site.',
  repoNote: 'Source: lowrys-seo-website — TECH-STACK.md, AI-SEO-BLUEPRINT.md.',
};
