export type ProjectTier =
  | 'flagship'
  | 'lead'
  | 'solo'
  | 'client'
  | 'enterprise';

export interface PortfolioProject {
  id: string;
  name: string;
  url?: string;
  role: string;
  period: string;
  status: 'Live' | 'In Progress' | 'Client Delivery' | 'Enterprise';
  tier: ProjectTier;
  summary: string;
  highlights: string[];
  stack: string[];
  image?: string;
  /** cover = crop to fill banner; contain = letterbox (for tall/square screenshots) */
  imageFit?: 'cover' | 'contain';
  /** Tailwind gradient classes for card header when no screenshot yet */
  accent?: string;
}

export const tierLabels: Record<ProjectTier, string> = {
  flagship: 'Flagship SaaS',
  lead: 'Lead Developer',
  solo: 'Solo Platforms',
  client: 'Client Delivery · EZ Web LLC',
  enterprise: 'Contract & Enterprise',
};

export const tierIntros: Partial<Record<ProjectTier, string>> = {
  client:
    'Production sites built for EZ Web clients — separate from owned SaaS products. More client work at ezweb.work.',
  solo: 'Additional solo-built platforms — secondary to flagship SaaS on the homepage.',
};

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 'workaide-jobs',
    name: 'WorkAide Jobs',
    url: 'https://jobs.workaide.ai',
    role: 'Owner-Developer',
    period: 'May 2026 – Present',
    status: 'Live',
    tier: 'flagship',
    summary:
      'AI-powered career workflow SaaS — multi-board inbox, AI match scoring, tailored application drafts, styled resume PDF export, and Stripe Pro subscriptions. Solo build from concept to production launch in ~48 hours, with billing, admin, and analytics live in production.',
    highlights: [
      'Next.js 16, React 19, Supabase, OpenAI, Stripe, Puppeteer PDF export',
      'Job collectors: JSearch, Findwork, Adzuna, USAJOBS, RSS, and more',
      'Cloudflare Turnstile, ATS alignment, admin analytics and promo codes',
      'Founder-operated in production — validated end-to-end, not a demo-only build',
    ],
    stack: ['Next.js 16', 'Supabase', 'OpenAI', 'Stripe', 'Vercel'],
    image: '/images/projects/workaide-jobs.png',
    accent: 'from-violet-600 to-indigo-700',
  },
  {
    id: 'ez-voice',
    name: 'EZ Voice',
    url: 'https://voice.ezweb.work',
    role: 'Owner-Developer (EZ Web flagship)',
    period: 'Apr 2026 – Present',
    status: 'Live',
    tier: 'flagship',
    summary:
      'Multi-tenant agentic AI phone SaaS on its own architecture — inbound voice agents with Vapi tool-calling for availability, booking, and consent-gated SMS. Separate codebase from EZWeb.work (NestJS/Prisma/Neon vs Supabase).',
    highlights: [
      'NestJS API on Railway, Next.js PWA on Vercel, Prisma + Neon Postgres',
      'Vapi + Twilio telephony, Gemini per tenant, Stripe subscription billing',
      'Google, Outlook, and CalDAV calendar integrations',
    ],
    stack: ['NestJS', 'Prisma', 'Neon', 'Vapi', 'Twilio', 'Stripe'],
    image: '/images/projects/ez-voice.png',
    accent: 'from-cyan-600 to-blue-700',
  },
  {
    id: 'ezweb',
    name: 'EZWeb.work',
    url: 'https://ezweb.work',
    role: 'Owner-Developer (EZ Web LLC)',
    period: 'Mar 2025 – Present',
    status: 'Live',
    tier: 'flagship',
    summary:
      'Agency operations platform with production agentic AI workflows — multi-model router, multi-agent SEO/blog pipeline, project-scoped admin agents, and homepage qualification chatbot.',
    highlights: [
      'Next.js 15, Supabase (30+ tables), multi-model router (Claude Opus, GPT-5.2, Gemini)',
      'Tavily research, Stripe invoicing, Resend, Cloudflare Turnstile',
      'Batch multi-agent content pipelines with human-in-the-loop publish',
    ],
    stack: ['Next.js 15', 'Supabase', 'Stripe', 'Tavily', 'Vercel'],
    image: '/images/projects/ezweb.png',
    accent: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'autoshops',
    name: 'Autoshops.com',
    url: 'https://autoshops.com',
    role: 'Lead Developer',
    period: 'Sept 2025 – Present',
    status: 'Live',
    tier: 'lead',
    summary:
      'B2B2C auto repair marketplace modernization with CTO — Vercel serverless migration, Firebase Auth, Stripe subscriptions, admin RBAC, and Google Maps Platform integration.',
    highlights: [
      'Shop approval workflows, confidence scoring, ~80% manual processing reduction',
      'Places, Geocoding, Maps JS — shop discovery and mechanic onboarding',
      'Playwright E2E CI design, GitHub Actions on Vercel previews',
    ],
    stack: ['Next.js', 'Firebase', 'MySQL', 'Stripe', 'Google Maps'],
    image: '/images/projects/autoshops.png',
    accent: 'from-orange-500 to-red-600',
  },
  {
    id: 'seo-lowrys',
    name: 'SEO.Lowrys.org',
    url: 'https://seo.lowrys.org',
    role: 'Solo Developer',
    period: '2025 – Present',
    status: 'Live',
    tier: 'solo',
    summary:
      'Enterprise multi-agent SEO platform — 5-agent coordinated architecture, MCP on Vercel, n8n orchestration, Google Cloud KMS on 65+ BI fields, DataForSEO and GA4/GSC integration.',
    highlights: [
      'Turso/LibSQL primary database, Firebase Auth',
      'mcp-handler serverless bridge at /api/mcp/',
      'Commercial pricing tiers with autonomous SEO optimization',
    ],
    stack: ['Next.js', 'Turso', 'MCP', 'n8n', 'DataForSEO'],
    image: '/images/projects/AISEOStrategies.png',
  },
  {
    id: 'pm-workaide',
    name: 'PM.WorkAide.ai',
    url: 'https://pm.workaide.ai',
    role: 'Solo Developer',
    period: '2025 – Present',
    status: 'Live',
    tier: 'solo',
    summary:
      'Enterprise project management SaaS — 16-table Supabase schema with RLS, Vercel AI SDK with Anthropic Claude multi-persona assistance (distinct codebase from WorkAide Jobs).',
    highlights: [
      'Super PM, Tech SME, and Governance SME personas',
      'Full project CRUD, dashboard integration, mobile-responsive UI',
      'User-controlled AI costs with enterprise security',
    ],
    stack: ['Next.js 14', 'Supabase', 'Vercel AI SDK', 'Claude'],
    image: '/images/projects/Workaide.ai.png',
    accent: 'from-slate-600 to-slate-800',
  },
  {
    id: 'airtisan',
    name: 'AIrtisan.net',
    url: 'https://airtisan.net',
    role: 'Solo Developer',
    period: '2025 – Present',
    status: 'Live',
    tier: 'solo',
    summary:
      'Blockchain-based art authentication platform for collectors — React frontend, Firebase backend, conversion-optimized UX with AI computer vision concepts.',
    highlights: [
      'Mobile-responsive with accessibility compliance',
      'Structured data and SEO targeting affluent collectors',
    ],
    stack: ['React', 'Firebase', 'TypeScript'],
    image: '/images/projects/AIrtisan.png',
  },
  {
    id: 'lowrys-analytics',
    name: 'Lowrys.org',
    url: 'https://lowrys.org',
    role: 'Solo Developer',
    period: '2025 – Present',
    status: 'Live',
    tier: 'solo',
    summary:
      'Workforce analytics portfolio — predictive attrition modeling, 50,000+ BLS occupation records, Chart.js and React-Globe.gl visualizations.',
    highlights: [
      'Automated BLS ETL pipelines with 99%+ accuracy',
      'Next.js 15, TypeScript, Turso/LibSQL',
    ],
    stack: ['Next.js 15', 'Turso', 'Chart.js', 'TypeScript'],
    image: '/images/projects/lowrys.png',
  },
  {
    id: 'ct-home',
    name: 'CT Home Remodel',
    url: 'https://www.cthomeremodel.com',
    role: 'EZ Web LLC — Client Site',
    period: '2025',
    status: 'Client Delivery',
    tier: 'client',
    summary:
      'Built cthomeremodel.com for a Hampton Roads / Virginia Beach home remodeling client under EZ Web LLC — marketing site with service pages, contact flow, and mobile-first layout.',
    highlights: [
      'Delivered as EZ Web agency client work (not an owned product)',
      'Next.js 14, Tailwind CSS, Resend contact form, Vercel hosting',
      'Listed on EZ Web portfolio — see ezweb.work for agency services',
    ],
    stack: ['Next.js 14', 'Tailwind', 'Resend', 'Vercel'],
    image: '/images/projects/CTHomeRemodel.png',
    accent: 'from-amber-600 to-orange-700',
  },
  {
    id: 'nike-iiot',
    name: 'Nike Extrusion (Mindlance)',
    role: 'Manufacturing Data Engineer',
    period: 'Jan – May 2026',
    status: 'In Progress',
    tier: 'enterprise',
    summary:
      'OT-to-IT pipeline for Nike Air extrusion — Kepware → ThingWorx → AMU → Azure. Remediated year-long data integrity failures; terabyte-scale rolling buffer with Python dashboards.',
    highlights: [
      '20+ machines, thousands of sensor points per second',
      'Predictive process-setup foundation for extrusion optimization',
    ],
    stack: ['Kepware', 'ThingWorx', 'Azure', 'Python', 'Power BI'],
    image: '/images/projects/NikeExtrusion.png',
    imageFit: 'contain',
    accent: 'from-gray-700 to-gray-900',
  },
];

export const featuredProjectIds = [
  'workaide-jobs',
  'ez-voice',
  'ezweb',
  'autoshops',
  'seo-lowrys',
  'pm-workaide',
];

export function getProjectById(id: string): PortfolioProject | undefined {
  return portfolioProjects.find((p) => p.id === id);
}
