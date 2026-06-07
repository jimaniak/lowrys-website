// src/app/about/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import ResumeAccessButton from '@/components/ResumeAccessButton';

export default function About() {
  return (
    <>
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white page-section">
        <div className="page-container">
          <h1 className="page-hero-title mb-4">About Jim Lowry, B.S.</h1>
          <p className="page-hero-subtitle max-w-3xl">
            AI-Native Product Engineer · Owner-Developer, EZ Web LLC · High Ridge, MO · Remote US
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="page-container">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="lg:w-1/3 order-1 lg:order-2">
              <div className="bg-gray-50 card-padding rounded-lg shadow-md lg:sticky lg:top-20">
                <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-6 overflow-hidden rounded-full">
                  <Image
                    src="/images/jim-lowry-profile.jpg"
                    alt="Jim Lowry, AI-Native Product Engineer"
                    width={192}
                    height={192}
                    className="object-cover w-full h-full object-[center_top]"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-center">Jim Lowry, B.S.</h3>
                <p className="text-center mb-6 text-gray-600 text-sm sm:text-base">
                  AI-Native Product Engineer<br />
                  <span className="text-sm">EZ Web LLC · Remote US</span>
                </p>
                <div className="space-y-2">
                  <a
                    href="https://www.linkedin.com/in/jimsitsecurity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition min-h-[44px] px-1"
                  >
                    <FaLinkedin size={22} />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://github.com/jimaniak"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition min-h-[44px] px-1"
                  >
                    <FaGithub size={22} />
                    <span>GitHub</span>
                  </a>
                  <ResumeAccessButton variant="primary" className="w-full justify-center min-h-[44px]" />
                  <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-3 rounded transition w-full min-h-[44px]"
                  >
                    Request Resume
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Resume access is gated — request via contact form and I&apos;ll email a one-time passcode.
                </p>
              </div>
            </div>

            <div className="lg:w-2/3 order-2 lg:order-1 min-w-0">
              <h2 className="section-title mb-6">From Railroad to Production SaaS</h2>
              <div className="space-y-5 text-base sm:text-lg leading-relaxed">
                <p>
                  My path to technology wasn&apos;t conventional. After years on the railroad, an injury ended that career
                  and pushed me back to college as a non-traditional student — older than my peers, with everything on the line.
                  That determination led to a Webster University B.S. in Information Management (Magna Cum Laude) and an
                  enterprise career I never would have predicted.
                </p>
                <p>
                  At Ameren, I spent ~9 years (May 2016 – March 2025) managing $50M+ in IT and cybersecurity programs
                  across 27 power generation facilities — often serving as both Project Manager and Business Analyst because
                  I never had the luxury of dedicated BAs on my projects. I progressed from Project Controls to OT cybersecurity
                  program delivery to Power Platform Architect, consolidating legacy PMO data into Dataverse and building
                  executive Power BI dashboards.
                </p>
                <p>
                  Since March 2025, I&apos;ve been owner-developer of <strong>EZ Web LLC</strong> — shipping production SaaS
                  with structured AI-assisted delivery (Cursor + canonical docs, session handoffs, completion checklists).
                  I&apos;m not a prompt-only operator; I own architecture, RLS, Stripe live/test config, deploy pipelines,
                  and production debugging on every product I ship.
                </p>
              </div>

              <h2 className="section-title mt-10 sm:mt-12 mb-6">What I&apos;m Building Now</h2>
              <div className="space-y-5 text-base sm:text-lg leading-relaxed">
                <p>
                  <strong>WorkAide Jobs</strong> (jobs.workaide.ai) — AI-powered career workflow SaaS I built and launched in ~48 hours
                  (May 2026): multi-board inbox, AI match scoring, tailored application drafts, styled resume PDF export,
                  and Stripe Pro billing — validated end-to-end in live production.
                </p>
                <p>
                  <strong>EZ Voice</strong> (voice.ezweb.work) — EZ Web&apos;s flagship agentic AI phone SaaS on its own
                  NestJS/Prisma/Neon stack. Real-time Vapi/Twilio tool-calling for booking and SMS — distinct from the
                  batch multi-agent pipelines on EZWeb.work.
                </p>
                <p>
                  <strong>EZWeb.work</strong> — agency operations platform with multi-model AI router, multi-agent SEO/blog
                  pipeline, and project-scoped admin agents. Plus <strong>Lead Developer</strong> on Autoshops.com marketplace
                  modernization and a Nike IIoT contract (Kepware, ThingWorx, Azure) via Mindlance.
                </p>
              </div>

              <h2 className="section-title mt-10 sm:mt-12 mb-6">Client Delivery · EZ Web LLC</h2>
              <div className="space-y-5 text-base sm:text-lg leading-relaxed">
                <p>
                  EZ Web LLC also delivers production sites for small business clients — separate from the SaaS products above.
                  I built{' '}
                  <a
                    href="https://www.cthomeremodel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    cthomeremodel.com
                  </a>{' '}
                  for a Hampton Roads home remodeling client (Next.js 14, Tailwind, Resend, Vercel).
                </p>
                <p className="text-gray-600">
                  Looking for web or AI services for your business? That work lives at{' '}
                  <a
                    href="https://ezweb.work"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    ezweb.work
                  </a>{' '}
                  — this site is focused on employment and production engineering work.
                </p>
              </div>

              <h2 className="section-title mt-10 sm:mt-12 mb-6">Structured AI-Native Delivery</h2>
              <div className="space-y-5 text-base sm:text-lg leading-relaxed">
                <p>
                  What I call structured vibe coding: engineering the environment where AI coding agents succeed in production —
                  reference docs, session continuity, work queues, and human ownership of shipped claims. Each repository
                  has canonical context so any new agent session resumes from summary documentation, not full chat replay.
                </p>
                <p>
                  That methodology is how I deliver at solo-founder velocity while maintaining production accountability —
                  equivalent output to a small cross-functional team, amplified by disciplined AI pair programming.
                </p>
              </div>

              <h2 className="section-title mt-10 sm:mt-12 mb-6">Education</h2>
              <div className="space-y-4 text-base sm:text-lg">
                <p>
                  <strong>Bachelor of Science in Information Management</strong><br />
                  Webster University · Magna Cum Laude · 2017
                </p>
                <p className="text-gray-600">
                  Coursework in Computer Programming — St. Louis Community College · 2014–2015
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
