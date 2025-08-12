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
              <h2 className="text-2xl md:text-3xl text-blue-400 mb-6">Data Analytics, SEO, AI Development & Technical Solutions</h2>
              <p className="text-lg mb-8">
                Versatile technical professional delivering data analytics, SEO optimization, AI-enhanced development, and comprehensive digital solutions—with enterprise project management experience that ensures deep understanding of business requirements and stakeholder needs.
              </p>
              <p className="text-md mb-6 text-blue-200">
                <strong>Adaptable Technical Expertise:</strong> Whether it's Power BI dashboards, SEO strategy, modern web development, or AI-enhanced solutions, my enterprise portfolio management background ($50M+ programs) provides unique insight into translating business needs into effective technical implementations.
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
          <h2 className="text-3xl font-bold text-center mb-12">Core Competencies & Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-semibold mb-3">Power BI & Data Visualization</h3>
              <p className="text-gray-600">
                Building interactive dashboards and reports with Power BI and Power Query (M) to turn raw data into actionable insights for real-world business impact.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaLaptopCode />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automation with Power Platform</h3>
              <p className="text-gray-600">
                Automating workflows and integrating data across systems using Power Automate, Dataverse, and custom connectors—reducing manual work and boosting efficiency.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaSearch />
              </div>
              <h3 className="text-xl font-semibold mb-3">SEO & Digital Marketing</h3>
              <p className="text-gray-600">
                Strategic SEO audits, keyword research, and digital marketing campaigns to improve search rankings and drive qualified traffic to your business.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaGlobe />
              </div>
              <h3 className="text-xl font-semibold mb-3">Website Development</h3>
              <p className="text-gray-600">
                Modern, responsive websites built with Next.js, React, and Tailwind CSS—optimized for performance, SEO, and user experience across all devices.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaRobot />
              </div>
              <h3 className="text-xl font-semibold mb-3">Technical Solutions with Business Insight</h3>
              <p className="text-gray-600">
                Delivering comprehensive technical solutions across analytics, development, and SEO with enterprise project management experience that provides deep understanding of stakeholder needs, requirements gathering, and solution delivery—ensuring technical work translates to real business value.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaTools />
              </div>
              <h3 className="text-xl font-semibold mb-3">Continuous Learning & Growth</h3>
              <p className="text-gray-600">
                Committed to expanding my analytics toolkit—currently learning advanced SQL, Tableau, and Google Data Studio to deliver even more value for clients and teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Data and Digital Presence?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you need analytics dashboards, SEO optimization, modern web development, or AI-enhanced solutions, let's discuss how technical expertise combined with enterprise project experience can deliver results that truly meet your business needs.
          </p>
          <a href="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
            Contact Me
          </a>
        </div>
      </section>
    </main>
  );
}