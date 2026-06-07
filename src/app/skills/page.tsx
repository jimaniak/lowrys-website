// src/app/skills/page.tsx
'use client';

import Link from 'next/link';
import { FaCheck } from 'react-icons/fa';
import Head from 'next/head';

const skillGroups = [
  {
    title: 'AI & LLM Delivery',
    items: [
      'Cursor, GitHub Copilot, structured AI-native development, prompt engineering',
      'OpenAI (GPT-4 / GPT-5 family), Anthropic Claude (incl. Opus), Google Gemini (2.0 / 2.5)',
      'Vercel AI SDK (PM.WorkAide.ai), multi-model routing with fallbacks',
      'Agentic AI: Vapi tool-calling (EZ Voice); batch multi-agent (EZWeb, SEO)',
      'MCP: mcp-handler, /api/mcp/ (SEO.Lowrys.org)',
    ],
  },
  {
    title: 'Full-Stack & Frameworks',
    items: [
      'TypeScript, JavaScript (ES6+), Node.js, React 18/19',
      'Next.js 14 / 15 / 16 (App Router), NestJS, Tailwind CSS',
      'REST APIs, serverless functions, component-driven UI',
    ],
  },
  {
    title: 'Databases & ORM',
    items: [
      'Supabase (PostgreSQL + RLS) — WorkAide Jobs, EZWeb, PM.WorkAide',
      'Neon + Prisma — EZ Voice multi-tenant schema',
      'Turso / LibSQL — SEO.Lowrys.org',
      'MySQL / AWS RDS — Autoshops.com',
      'Firebase Auth, Dataverse (Ameren / Power Platform)',
    ],
  },
  {
    title: 'Voice, Telephony & Integrations',
    items: [
      'Vapi.ai, Twilio (inbound, SMS, STIR/SHAKEN-aware flows)',
      'CalDAV, Google Calendar, Outlook (EZ Voice scheduling)',
      'Google Maps Platform — Places, Geocoding, Maps JS (Autoshops)',
      'DataForSEO, GA4, Search Console (SEO.Lowrys.org)',
    ],
  },
  {
    title: 'Payments, Hosting & SaaS Ops',
    items: [
      'Stripe (Checkout, webhooks, subscriptions, Customer Portal)',
      'Vercel, Railway, Resend, Cloudflare Turnstile',
      'Puppeteer PDF export, Playwright E2E (Autoshops CI design)',
      'Job board APIs: JSearch, Findwork, Adzuna, USAJOBS, RSS',
    ],
  },
  {
    title: 'Enterprise & IIoT (when relevant)',
    items: [
      'Power Platform: Dataverse, Power Apps, Power Automate, Power BI, DAX, Power Query (M)',
      'Kepware, ThingWorx, AMU, Azure — Nike extrusion pipeline',
      'OT security: Tenable OT, Verve, CyberX; Splunk playbooks',
      'Google Cloud KMS, n8n orchestration, enterprise RLS patterns',
    ],
  },
];

export default function Skills() {
  return (
    <>
      <Head>
        <title>Technical Skills | AI-Native Product Engineer | Jim Lowry</title>
        <meta
          name="description"
          content="Technical skills of Jim Lowry — AI-native product engineer. TypeScript, Next.js, NestJS, Supabase, Neon, Vapi, Stripe, MCP, multi-agent AI, and enterprise Power Platform background."
        />
        <link rel="canonical" href="https://www.lowrys.org/skills" />
      </Head>

      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white page-section">
        <div className="page-container">
          <h1 className="page-hero-title mb-4">Technical Skills</h1>
          <p className="page-hero-subtitle max-w-3xl">
            Production-shipped across multiple stacks — matched honestly to each product.
            Not one-vendor-per-category; the full inventory below reflects what I&apos;ve actually deployed.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-12 bg-gray-50">
        <div className="page-container max-w-3xl mx-auto text-center">
          <p className="text-sm sm:text-lg text-gray-700">
            Skills are organized by category with product attribution. When a job posting mentions a category broadly,
            I include every documented term in that category that honestly fits — not just the most common vendor.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 max-w-5xl mx-auto">
            {skillGroups.map((group) => (
              <div key={group.title} className="bg-white card-padding rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">{group.title}</h2>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start text-sm">
                      <FaCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-blue-600 text-white text-center">
        <div className="page-container">
          <h2 className="section-title mb-4">See It in Production</h2>
          <p className="text-base sm:text-xl mb-8 max-w-2xl mx-auto">
            Skills map to live products — visit the portfolio or request resume access for full experience detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/projects" className="btn-touch-full bg-white text-blue-600 hover:bg-gray-100 font-medium">
              View Projects
            </Link>
            <Link href="/contact" className="btn-touch-full bg-transparent hover:bg-blue-700 text-white border border-white font-medium">
              Request Resume
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
