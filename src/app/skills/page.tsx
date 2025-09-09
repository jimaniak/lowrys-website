// src/app/skills/page.tsx
'use client';

import { FaChartLine, FaLaptopCode, FaTools, FaCheck } from 'react-icons/fa';
import Head from 'next/head';

export default function Skills() {

  return (
    <>
      <Head>
        <title>AI Solutions Architecture Skills | Multi-Agent AI Platforms, Strategic AI Collaboration | Jim Lowry</title>
        <meta name="description" content="Explore Jim Lowry's AI Solutions Architecture and strategic AI collaboration expertise. Specializing in multi-agent AI platforms, commercial AI development, and enterprise-grade AI solutions for accelerated business outcomes." />
        <meta name="keywords" content="AI Solutions Architecture, AI collaboration, multi-agent AI platforms, strategic AI consulting, AI platform development, commercial AI solutions, AI workflow orchestration, prompt engineering, human-AI collaboration, Model Context Protocol, MCP, enterprise AI, AI-enhanced development, Next.js AI, TypeScript AI, predictive analytics, AI business intelligence, Jim Lowry" />
        <link rel="canonical" href="https://www.lowrys.org/skills" />
        {/* Service Schema Markup */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Jim Lowry, B.S.",
              "url": "https://www.lowrys.org/",
              "description": "AI Solutions Architect specializing in multi-agent AI platforms, strategic AI collaboration, and commercial AI platform development."
            }
          `}
        </script>
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">AI Solutions Architecture & Strategic AI Collaboration Skills</h1>
          <p className="text-xl max-w-3xl">
            Mastered strategic AI collaboration and multi-agent AI platform development. Delivering commercial-grade AI solutions through advanced human-AI partnership methodologies, with three deployed platforms demonstrating enterprise-quality results and accelerated business outcomes.
          </p>
        </div>
      </section>

      {/* Skills Introduction */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">AI-Driven Solutions Architecture Mastery</h2>
            <p className="text-lg mb-8">
              My approach leverages mastered AI collaboration methodologies, strategic human-AI partnerships, and proven commercial platform deployment:
            </p>
            <ul className="text-left mx-auto max-w-xl space-y-2">
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Architecting multi-agent AI platforms with specialized business intelligence agents</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Implementing Model Context Protocol (MCP) for enterprise AI collaboration</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Deploying commercial-grade platforms through strategic AI partnership</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Delivering accelerated enterprise solutions with measurable business impact</span>
              </li>
            </ul>
            <div className="mt-6 text-blue-700 text-md">
              <strong>Core Expertise:</strong> Strategic AI collaboration, multi-agent architecture, and commercial AI platform development with three deployed solutions.
            </div>
          </div>
        </div>
      </section>

      {/* AI Solutions Architecture & Multi-Agent Systems */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="text-blue-600 text-6xl">
                <FaChartLine />
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-3xl font-bold mb-4">Multi-Agent AI Platforms & Strategic Collaboration</h2>
              <p className="text-lg mb-6">
                Architecting sophisticated multi-agent AI systems with specialized business intelligence agents, implementing advanced human-AI collaboration methodologies for commercial-grade platform development.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Strategic AI Collaboration Mastery</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Advanced prompt engineering and human-AI partnership methodologies</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Model Context Protocol (MCP) implementation for enterprise AI workflows</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>AI workflow orchestration with n8n automation systems</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Accelerated development cycles through strategic AI partnership</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Commercial AI Platform Development</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>SEO.Lowrys.org - Enterprise multi-agent SEO platform</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>AIrtisan.net - Blockchain-certified art authentication platform</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Workforce Analytics - Predictive modeling with automated BLS data processing</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Enterprise-grade security with Google Cloud KMS and AES-256-GCM encryption</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise AI Development & Modern Tech Stack */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="text-blue-600 text-6xl">
                <FaLaptopCode />
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-3xl font-bold mb-4">Enterprise AI Development & Modern Tech Stack</h2>
              <p className="text-lg mb-6">
                Building enterprise-grade AI solutions through strategic human-AI collaboration, leveraging cutting-edge technologies and scalable cloud architectures for accelerated business outcomes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">AI-Enhanced Full-Stack Development</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Next.js 15, React 18, TypeScript 5.0 for modern web applications</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Turso/LibSQL distributed databases with complex SQL optimization</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Firebase Cloud Functions, Firestore, and real-time messaging systems</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>API development with 36+ endpoint migrations and integrations</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Enterprise Security & Cloud Architecture</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Google Cloud KMS enterprise security migration</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>AES-256-GCM encryption implementation for sensitive data</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Vercel deployment with CI/CD automation and environment management</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Scalable microservices architecture with real-time data processing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Continuous Learning Advantage & Business Impact */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="text-blue-600 text-6xl">
                <FaTools />
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-3xl font-bold mb-4">Continuous Learning Advantage & Business Impact</h2>
              <p className="text-lg mb-6">
                My commitment to continuous learning—from necessity after railroad injury to mastering AI collaboration—enables rapid adaptation and accelerated innovation across diverse domains.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">The Meta-Skill: AI Collaboration Mastery</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Mastered strategic AI collaboration rather than just specific technologies</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Rapid deployment across diverse domains through AI partnership</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Continuous learning enables adaptation to emerging AI capabilities</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Enterprise project management background ensures business-focused solutions</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Proven Commercial Results</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Three commercial platforms deployed demonstrating AI mastery</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Enterprise-grade security and scalability in all implementations</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Accelerated development cycles through strategic AI collaboration</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Measurable business impact through AI-enhanced solutions architecture</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Innovation with AI Solutions Architecture?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's discuss how strategic AI collaboration, multi-agent platforms, and enterprise-grade AI solutions can accelerate your business outcomes and deliver competitive advantages.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/projects" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
              View AI Platforms
            </a>
            <a href="https://seo.lowrys.org" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition duration-300">
              Experience AI SEO Platform
            </a>
            <a href="/contact" className="bg-transparent hover:bg-blue-700 text-white px-8 py-3 border border-white rounded-lg font-medium transition duration-300">
              Discuss AI Solutions
            </a>
          </div>
        </div>
      </section>
    </>
  );
}