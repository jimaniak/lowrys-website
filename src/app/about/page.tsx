// src/app/about/page.tsx
'use client';

import Image from 'next/image';
import { FaLinkedin } from 'react-icons/fa';
import ResumeAccessButton from '@/components/ResumeAccessButton';

// Note: Metadata should be in a separate layout.tsx file or using generateMetadata
export default function About() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">About Jim Lowry, B.S.</h1>
          <p className="text-xl max-w-3xl">
            AI Solutions Architect & Full-Stack Engineer | Mastering Strategic AI Collaboration Through Continuous Learning
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left Column - Bio */}
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-6">My Journey: From Railroad to Enterprise Technology</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  My path to technology wasn't conventional. After 16 years working for the railroad, an injury ended that career and put me at a major crossroads. I faced a choice that many blue-collar workers might not have considered: go back to college as a non-traditional student, much older than my peers, with everything on the line.
                </p>
                <p className="text-lg">
                  It was intimidating being different from my classmates, but I pressed on because I felt I had no other options. If this didn't work, I risked losing the financial stability I was accustomed to. That fear and determination drove me to succeed in ways I never expected.
                </p>
                <p className="text-lg">
                  That leap of faith led to an enterprise technology career managing $50M+ in cybersecurity portfolios across critical infrastructure. Over 7 years, I led concurrent projects while serving as both Project Manager and Business Analyst—learning to fill whatever gaps needed filling because I "never had the luxury" of having dedicated BAs on my projects.
                </p>
                <p className="text-lg">
                  Today, I'm a versatile technical professional working across data analytics, SEO optimization, AI-enhanced development, and modern web solutions. My railroad background taught me work ethic and problem-solving; my enterprise experience taught me stakeholder management and business requirements; my recent journey into AI and full-stack development keeps me current with emerging technologies.
                </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">The Value of a Non-Linear Path</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  My unconventional journey gives me a unique perspective that pure technical backgrounds often lack. I understand what it's like to face real stakes, to reinvent yourself when circumstances demand it, and to succeed despite feeling like an outsider.
                </p>
                <p className="text-lg">
                  This experience makes me particularly effective at translating between different worlds—whether that's business stakeholders and technical teams, or legacy systems and modern solutions. I've learned to be adaptable, resilient, and focused on delivering real value rather than just technical features.
                </p>
                <p className="text-lg">
                  I'm drawn to AI-enhanced development and modern web technologies because they represent the future, but my enterprise portfolio management background ensures I always think about scalability, stakeholder needs, and business impact. I'm not just building technology—I'm solving problems.
                </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Current Role: AI Solutions Architecture & Commercial Platform Development</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  <strong>AI Solutions Developer & Full-Stack Engineer (2025 – Present)</strong>
                </p>
                <p className="text-lg">
                  Through continuous learning and experimentation, I've mastered strategic AI collaboration—the art of partnering with AI to architect and build commercial-grade platforms. This isn't about using AI as a simple tool, but developing sophisticated human-AI collaboration methodologies that enable rapid development of enterprise-quality solutions.
                </p>
                <p className="text-lg">
                  I've successfully deployed three commercial platforms that demonstrate this AI collaboration mastery:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li className="text-lg"><strong>SEO.Lowrys.org:</strong> Enterprise multi-agent SEO platform with specialized business intelligence agents</li>
                  <li className="text-lg"><strong>AIrtisan.net:</strong> Blockchain-certified art authentication platform</li>
                  <li className="text-lg"><strong>Workforce Analytics Platform:</strong> Predictive analytics with automated BLS data processing and business intelligence dashboards</li>
                </ul>
                <p className="text-lg">
                  These platforms represent more than technical achievement—they demonstrate how continuous learning, combined with strategic AI collaboration, can accelerate complex solution development while maintaining enterprise-grade quality and business value.
                </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Education & Professional Evolution</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  <strong>Bachelor of Science in Information Management</strong><br />
                  George Herbert Walker School of Business & Technology, Webster University
                </p>
                <p className="text-lg">
                  Returning to school as a non-traditional student after 16 years in the railroad industry was challenging, but it provided crucial foundation in information systems, business process optimization, and analytical thinking that would prove essential in my enterprise technology career.
                </p>
                <p className="text-lg">
                  <strong>Enterprise Portfolio Management Experience:</strong> 7 years managing $50M+ in cybersecurity programs across critical infrastructure, serving dual roles as Project Manager and Business Analyst across multiple concurrent projects.
                </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">How Continuous Learning Led to AI Mastery</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  My commitment to continuous learning—driven by necessity after my railroad injury, reinforced through enterprise portfolio management, and accelerated by the possibilities I saw in AI—is what enabled me to master strategic AI collaboration. This learning journey encompassed:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li className="text-lg"><strong>Strategic AI Collaboration:</strong> Mastered advanced prompt engineering and human-AI partnership methodologies to build commercial-grade platforms</li>
                  <li className="text-lg"><strong>Multi-Agent AI Architecture:</strong> Implemented sophisticated AI systems with specialized agents for business intelligence and automation</li>
                  <li className="text-lg"><strong>Modern Full-Stack Development:</strong> Built enterprise applications using Next.js 15, TypeScript, React, and distributed databases through AI collaboration</li>
                  <li className="text-lg"><strong>Predictive Analytics & Data Intelligence:</strong> Developed AI-enhanced workforce analytics with automated BLS data processing and machine learning models</li>
                  <li className="text-lg"><strong>Enterprise-Grade Security & Infrastructure:</strong> Implemented Google Cloud KMS, AES-256-GCM encryption, and scalable cloud architectures</li>
                </ul>
                <p className="text-lg">
                  <strong>The Continuous Learning Advantage:</strong> Unlike traditional developers who master specific technologies, I mastered the meta-skill of AI collaboration itself. This enables me to rapidly architect and deploy complex solutions across diverse domains—from SEO platforms to blockchain authentication to workforce analytics.
                </p>
                <p className="text-lg">
                  <strong>Philosophy:</strong> Continuous learning + AI collaboration = accelerated innovation. My diverse background—from blue-collar work ethic to enterprise project leadership—combined with strategic AI partnership enables me to build solutions that are technically sophisticated, business-focused, and rapidly deployable.
                </p>
              </div>
            </div>

            {/* Right Column - Profile and Links */}
            <div className="md:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                {/* Profile Image */}
                <div className="w-48 h-48 mx-auto mb-6 overflow-hidden rounded-full">
                  <Image 
                    src="/images/jim-lowry-profile.jpg"
                    alt="Jim Lowry, Versatile Technical Professional specializing in Enterprise Portfolio Management, AI Development, and Analytics"
                    width={192}
                    height={192}
                    className="object-cover w-full h-full object-[center_top]"
                  />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">Jim Lowry, B.S.</h3>
                <p className="text-center mb-6">AI Solutions Architect & Full-Stack Engineer<br />
                <span className="text-sm text-gray-600">Multi-Agent AI Platforms • Strategic AI Collaboration • Commercial Platform Development</span></p>
                <div className="space-y-4">
                  <a 
                    href="https://www.linkedin.com/in/jimsitsecurity" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition"
                  >
                    <FaLinkedin size={24} />
                    <span>LinkedIn Profile</span>
                  </a>
                  <ResumeAccessButton variant="primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}