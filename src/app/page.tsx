// src/app/page.tsx

import Image from "next/image";
import Link from "next/link";
import { FaChartLine, FaLaptopCode, FaTools, FaSearch, FaGlobe, FaRocket, FaRobot } from 'react-icons/fa';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Jim Lowry, B.S.</h1>
              <h2 className="text-2xl md:text-3xl text-blue-400 mb-6">AI Solutions Architect & Full-Stack Engineer</h2>
              <p className="text-lg mb-8">
                Advanced AI solutions architect specializing in multi-agent AI platforms, strategic AI collaboration, and enterprise-grade commercial applications. Currently developing cutting-edge AI-enhanced platforms through innovative human-AI collaboration methodologies.
              </p>
              <p className="text-md mb-6 text-blue-200">
                <strong>Commercial AI Platform Developer:</strong> Built three commercial-grade AI platforms including enterprise multi-agent SEO systems and blockchain-certified art authentication. My enterprise portfolio management background ($50M+ programs) ensures AI solutions deliver measurable business value and meet complex stakeholder requirements.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300">
                  Get in Touch
                </Link>
                <a href="https://seo.lowrys.org" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition duration-300">
                  SEO Consultation
                </a>
                <Link href="/projects" className="bg-transparent hover:bg-white hover:text-gray-900 text-white px-6 py-3 border border-white rounded-lg transition duration-300">
                  View Projects
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-64 h-64 overflow-hidden rounded-full border-4 border-blue-400">
                <Image 
                  src="/images/jim-lowry-profile.jpg"
                  alt="Jim Lowry, Data Analytics, SEO & Website Development Specialist"
                  width={256}
                  height={256}
                  className="object-cover w-full h-full object-[center_top]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Competencies Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">AI Solutions Architecture & Strategic Collaboration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaRobot />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Agent AI Platforms</h3>
              <p className="text-gray-600">
                Architecting sophisticated multi-agent AI systems with specialized business intelligence agents, implementing Model Context Protocol (MCP) for enterprise-grade AI collaboration workflows.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaLaptopCode />
              </div>
              <h3 className="text-xl font-semibold mb-3">Strategic AI Collaboration</h3>
              <p className="text-gray-600">
                Advanced prompt engineering and human-AI collaboration methodologies to build commercial-grade platforms. Mastered the art of AI partnership to deliver complex technical solutions efficiently.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaSearch />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enterprise AI-Enhanced SEO</h3>
              <p className="text-gray-600">
                SEO.Lowrys.org - Commercial multi-agent SEO platform delivering strategic audits, keyword research, and automated optimization through AI-powered analysis and recommendations.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaGlobe />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Web Development</h3>
              <p className="text-gray-600">
                Modern full-stack applications built through AI collaboration using Next.js 15, TypeScript, and distributed databases—delivering enterprise-grade solutions with accelerated development cycles.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-semibold mb-3">Predictive Analytics & Data Intelligence</h3>
              <p className="text-gray-600">
                AI-enhanced workforce analytics with predictive modeling, automated BLS data processing, and business intelligence dashboards—transforming complex datasets into actionable insights through AI collaboration.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaRocket />
              </div>
              <h3 className="text-xl font-semibold mb-3">Commercial Platform Development</h3>
              <p className="text-gray-600">
                Three commercial-grade AI platforms in production including blockchain art authentication (AIrtisan.net) and enterprise workforce analytics—demonstrating proven ability to deliver AI solutions that create real business value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Leverage AI Solutions Architecture for Your Business?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you need multi-agent AI platforms, strategic AI collaboration consulting, or enterprise-grade AI-enhanced applications, let's discuss how advanced AI solutions architecture combined with proven commercial platform development can accelerate your business outcomes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
              Discuss AI Solutions
            </a>
            <a href="https://seo.lowrys.org" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition duration-300">
              View AI SEO Platform
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}