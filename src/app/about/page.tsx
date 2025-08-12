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
            Versatile Technical Professional | From Enterprise Portfolio Management to AI-Enhanced Development
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

              <h2 className="text-3xl font-bold mt-12 mb-6">Current Technical Focus & Continuous Learning</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  I'm passionate about staying current with emerging technologies while leveraging the business insight gained from enterprise experience. My current areas of focus include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li className="text-lg"><strong>AI-Enhanced Development:</strong> Exploring how AI tools can accelerate and improve technical solution delivery</li>
                  <li className="text-lg"><strong>Modern Web Development:</strong> Building with Next.js, React, and modern frameworks</li>
                  <li className="text-lg"><strong>Data Analytics & Visualization:</strong> Power BI, data transformation, and business intelligence</li>
                  <li className="text-lg"><strong>SEO & Digital Marketing:</strong> Technical SEO, analytics, and digital presence optimization</li>
                  <li className="text-lg"><strong>Business Analysis:</strong> Requirements gathering, stakeholder management, and solution design</li>
                </ul>
                <p className="text-lg">
                  My approach combines technical implementation with deep understanding of business requirements—ensuring solutions don't just work technically, but deliver real value to stakeholders and end users.
                </p>
                <p className="text-lg">
                  <strong>Philosophy:</strong> Technology should solve real problems. My diverse background—from blue-collar work ethic to enterprise project leadership—helps me build solutions that are both technically sound and practically valuable.
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
                <p className="text-center mb-6">Versatile Technical Professional<br />
                <span className="text-sm text-gray-600">Enterprise Portfolio Management • AI Development • Analytics</span></p>
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
}