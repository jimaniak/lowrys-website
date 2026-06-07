// src/app/page.tsx

import Image from "next/image";
import Link from "next/link";
import { FaRobot, FaLaptopCode, FaRocket, FaMicrophone, FaBriefcase, FaCogs } from 'react-icons/fa';
import HomeHeroActions from '@/components/HomeHeroActions';
import HomeCtaActions from '@/components/HomeCtaActions';
import ProjectCard from '@/components/ProjectCard';
import { featuredProjectIds, portfolioProjects } from '@/data/portfolio';

const featuredProjects = featuredProjectIds
  .map((id) => portfolioProjects.find((p) => p.id === id))
  .filter(Boolean);

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white page-section">
        <div className="page-container">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
            {/* Photo first on mobile for immediate personal connection */}
            <div className="flex justify-center order-1 md:order-2 md:w-1/2 shrink-0">
              <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 overflow-hidden rounded-full border-4 border-blue-400">
                <Image
                  src="/images/jim-lowry-profile.jpg"
                  alt="Jim Lowry, AI-Native Product Engineer"
                  width={256}
                  height={256}
                  className="object-cover w-full h-full object-[center_top]"
                  priority
                />
              </div>
            </div>

            <div className="order-2 md:order-1 md:w-1/2 min-w-0">
              <p className="text-blue-300 text-xs sm:text-sm font-medium uppercase tracking-wide mb-3">
                Owner-Developer · EZ Web LLC · Remote US
              </p>
              <h1 className="page-hero-title mb-3">Jim Lowry, B.S.</h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl text-blue-400 mb-5">AI-Native Product Engineer</h2>
              <p className="text-base sm:text-lg mb-5 leading-relaxed">
                I ship production SaaS end-to-end — architecture, data model, APIs, payments, admin, and deploy —
                using structured AI-assisted delivery with Cursor. Human-owned architecture, security, and production fixes;
                AI accelerates implementation.
              </p>
              <p className="text-sm sm:text-base mb-6 text-blue-200 leading-relaxed">
                <strong>Recent proof:</strong> WorkAide Jobs (jobs.workaide.ai) from build to production launch in ~48 hours;
                EZ Voice agentic phone SaaS (voice.ezweb.work); Lead Developer on Autoshops.com — backed by ~9 years at Ameren
                managing $50M+ in critical infrastructure programs.
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mb-5">
                Request resume access below — I&apos;ll send a one-time code to your email. No public resume link.
              </p>
              <HomeHeroActions />
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-gray-50">
        <div className="page-container">
          <h2 className="section-title text-center mb-4">What I Build</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10 text-sm sm:text-base">
            Production SaaS across voice AI, job-search tech, agency ops, marketplaces, and multi-agent platforms —
            output comparable to a small product team, as one accountable engineer.
          </p>
          <div className="card-grid-3">
            {[
              { icon: FaBriefcase, title: 'B2C SaaS Velocity', text: 'WorkAide Jobs — career-workflow SaaS with multi-board inbox, AI scoring and drafts, resume export, and Stripe Pro. Solo build from concept to production launch in ~48 hours.' },
              { icon: FaMicrophone, title: 'Agentic Voice AI', text: 'EZ Voice — real-time Vapi/Twilio tool-calling for booking and SMS on NestJS, Prisma, and Neon. Flagship product with its own architecture, separate from EZWeb.work.' },
              { icon: FaCogs, title: 'Multi-Agent Pipelines', text: 'EZWeb.work and SEO.Lowrys.org — batch agentic workflows, MCP, n8n, multi-model routers, and enterprise-grade security (KMS, Turso, Supabase RLS).' },
              { icon: FaLaptopCode, title: 'Marketplace Engineering', text: 'Lead Developer on Autoshops.com — Stripe subscriptions, Google Maps Platform, Firebase Auth, admin RBAC, and Vercel migration from legacy hosting.' },
              { icon: FaRobot, title: 'Structured AI Delivery', text: 'Canonical docs, session handoffs, and completion checklists in every repo so AI coding sessions resume with full product context — not prompt-only development.' },
              { icon: FaRocket, title: 'Enterprise Foundation', text: '~9 years at Ameren — $50M+ portfolio management, OT cybersecurity across 27 facilities, Power Platform and Dataverse consolidation. Nike IIoT contract (Kepware, ThingWorx, Azure).' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white card-padding rounded-lg shadow-md">
                <div className="text-blue-600 text-3xl sm:text-4xl mb-4 flex justify-center">
                  <Icon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center">{title}</h3>
                <p className="text-gray-600 text-center text-sm sm:text-base">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-container">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12">
            <div>
              <h2 className="section-title mb-2">Featured Production Work</h2>
              <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
                Live platforms you can visit — each with distinct architecture and stack choices.
              </p>
            </div>
            <Link href="/projects" className="text-blue-600 hover:text-blue-800 font-medium min-h-[44px] inline-flex items-center">
              View full portfolio →
            </Link>
          </div>
          <div className="card-grid-2">
            {featuredProjects.map((project) =>
              project ? <ProjectCard key={project.id} project={project} /> : null
            )}
          </div>
        </div>
      </section>

      <section className="page-section bg-blue-600 text-white text-center">
        <div className="page-container">
          <h2 className="section-title mb-4">Interested in Working Together?</h2>
          <p className="text-base sm:text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
            Open to AI product engineering, full-stack, and technical lead roles — remote US or hybrid near St. Louis, MO.
          </p>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto text-xs sm:text-sm">
            Resume access is gated — submit a request and I&apos;ll email you a one-time passcode after review.
          </p>
          <HomeCtaActions />
        </div>
      </section>
    </main>
  );
}
