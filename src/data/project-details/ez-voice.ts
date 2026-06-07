import type { ProjectDetail } from './types';

export const ezVoiceDetail: ProjectDetail = {
  id: 'ez-voice',
  tagline:
    'EZ Web flagship — multi-tenant agentic AI phone SaaS with real-time voice, tool-calling, and calendar booking.',
  overview:
    'EZ Voice is a standalone product at voice.ezweb.work — separate codebase and stack from EZWeb.work. NestJS API on Railway, Next.js dashboard on Vercel, and Neon Postgres via Prisma. Tenants get inbound AI phone agents powered by Vapi and Twilio, with Gemini-driven tool-calling for availability checks, appointment booking, and consent-gated SMS.',
  velocity:
    'Built as a pnpm monorepo (apps/api, apps/dashboard, packages/database) with Cursor + MANUS_CONTEXT.md session handoffs. Vapi assistants, Twilio provisioning, and Stripe billing reached production April 2026.',
  architecture: [
    {
      title: 'Monorepo & hosting',
      items: [
        'NestJS API on Railway — api.voice.ezweb.work',
        'Next.js App Router PWA on Vercel — app.voice.ezweb.work',
        'Public marketing at voice.ezweb.work',
        'Prisma + Neon Postgres, shared schema with tenant row isolation',
      ],
    },
    {
      title: 'Agentic voice',
      items: [
        'Vapi.ai real-time voice orchestration',
        'Google Gemini default LLM (per-tenant configurable)',
        'Server tools: checkAvailability, bookAppointment, sendConfirmationSms',
        'Vapi assistant + Twilio number provisioning on onboarding',
      ],
    },
    {
      title: 'Telephony & security',
      items: [
        'Twilio inbound routing and SMS',
        'STIR/SHAKEN attestation on voice webhooks',
        'httpOnly session cookies, strict tenantId scoping',
        'SMS consent model — TCPA-aligned opt-in before appointment texts',
      ],
    },
    {
      title: 'Calendars & scheduling',
      items: [
        'Google OAuth, Microsoft Graph, CalDAV adapters',
        'Booking rules: lead time, buffers, window hours, concurrent caps',
        'Appointments UI — month/week/list views',
      ],
    },
    {
      title: 'Onboarding & billing',
      items: [
        '6-step tenant intake wizard with OnboardingSession draft resume',
        'Plans: Personal ($49) through Enterprise ($299)',
        'Stripe subscriptions, Customer Portal, trial banners',
        'EZ Web platform admin panel for MRR, plans, tenant suspend/reactivate',
      ],
    },
    {
      title: 'Tenant RBAC',
      items: [
        'DB-backed roles and permissions per tenant',
        'Corporate Admin vs Staff scopes',
        'In-dashboard “Easy” help agent with route-aware context',
      ],
    },
  ],
  shipped: [
    'End-to-end Vapi AI voice assistant delivery per tenant',
    '6-step onboarding with background Vapi + Twilio provisioning',
    'Full assistant configuration UI (persona, voice, system prompt, call behavior)',
    'Stripe billing with plan restructure and admin-dismissible upgrade banners',
    'Calendar integrations and appointment booking via voice tool-calling',
    'Platform admin stats, plan editor with Stripe sync, tenant management',
    'Stripe-inspired dashboard shell with mobile drawer navigation',
  ],
  distinctFrom:
    'EZ Voice uses NestJS/Prisma/Neon — not the EZWeb.work Supabase stack. EZWeb.work is the agency ops platform; EZ Voice is the flagship telephony SaaS product line under EZ Web LLC.',
  repoNote: 'Source: EZWeb - EZ Voice — docs/MANUS_CONTEXT.md, Master Project Index & Context Tracker.',
};
