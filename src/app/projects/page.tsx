// src/app/projects/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { FaChartBar, FaCode, FaTools, FaExternalLinkAlt, FaDatabase, FaProjectDiagram, FaRobot, FaChartLine, FaLightbulb, FaCheckCircle, FaArrowRight, FaNetworkWired, FaHome, FaShieldAlt, FaWrench, FaServer } from 'react-icons/fa';

export default function Projects() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">AI Solutions Architecture & Commercial Platform Development</h1>
          <p className="text-xl max-w-3xl leading-relaxed">
            Three deployed commercial-grade AI platforms demonstrating mastery of strategic AI collaboration, multi-agent architecture, and enterprise-grade development. Built upon $50M+ portfolio management foundation across 7 years of critical infrastructure experience, now applying this expertise to cutting-edge AI solutions that deliver accelerated business outcomes.
          </p>
        </div>
      </section>

      {/* Project Overview Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">AI Solutions Architecture & Enterprise Experience</h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto">
            Current commercial AI platforms demonstrate mastery of strategic AI collaboration and multi-agent architecture, while foundational enterprise experience showcases the project management and business analysis expertise that ensures AI solutions deliver measurable business value. Together, they represent a unique combination of cutting-edge AI capabilities with proven enterprise delivery experience.
          </p>
        </div>
      </section>

      {/* AI-Integrated Commercial Platforms */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <FaRobot className="text-blue-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">AI-Integrated Commercial Platforms</h2>
          </div>
          <div className="grid md:grid-cols-1 gap-12">
            
            {/* SEO.Lowrys.org - Multi-Agent AI SEO Platform */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="seo-lowrys-platform">
              <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 relative overflow-hidden">
                <Image 
                  src="/images/AISEOStrategies.png" 
                  alt="SEO.Lowrys.org - Enterprise Multi-Agent AI SEO Platform Dashboard" 
                  width={600} 
                  height={256}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-90 hover:opacity-100 transition-opacity"
                  unoptimized={true}
                />
                <div className="absolute top-4 right-4">
                  <a 
                    href="https://seo.lowrys.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <FaExternalLinkAlt className="text-sm" />
                    Visit Platform
                  </a>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">SEO.Lowrys.org - Enterprise Multi-Agent AI SEO Platform</h3>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaRobot className="mr-2" /> AI Architecture
                  </h4>
                  <p className="text-gray-700">
                    5-agent coordinated architecture (Morgan, Alex, Casey, Sam, Nova) implementing Model Context Protocol (MCP) with Anthropic Claude Sonnet and OpenAI GPT-4 Turbo. Features AI workflow orchestration through n8n automation, enterprise security with Google Cloud KMS and AES-256-GCM encryption, and sophisticated business intelligence framework with 65+ encrypted strategic data fields.
                  </p>
                </div>
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Enterprise Features
                  </h4>
                  <p className="text-gray-700">
                    Professional SEO intelligence APIs (DataForSEO, Google Analytics 4, Search Console), Firebase authentication with multi-factor authentication, role-based access control, distributed edge database (Turso), webhook-based microservices architecture, and intelligent session management for concurrent users. Transformed from basic SEO tools to strategic business consulting platform.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Multi-Agent AI</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">MCP Implementation</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Enterprise Security</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Google Cloud KMS</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Next.js 14</span>
                </div>
              </div>
            </div>

            {/* AIrtisan.net - AI Art Authentication Platform */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="airtisan-platform">
              <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-100 relative overflow-hidden">
                <Image 
                  src="/images/AIrtisan.png" 
                  alt="AIrtisan.net - AI-Powered Art Authentication Platform Interface" 
                  width={600} 
                  height={256}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-90 hover:opacity-100 transition-opacity"
                  unoptimized={true}
                />
                <div className="absolute top-4 right-4">
                  <a 
                    href="https://airtisan.net" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <FaExternalLinkAlt className="text-sm" />
                    Visit Platform
                  </a>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">AIrtisan.net - AI-Powered Art Authentication Platform</h3>
                <div className="mb-6 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="flex items-center text-purple-700 font-semibold mb-2">
                    <FaRobot className="mr-2" /> AI Integration & Business Design
                  </h4>
                  <p className="text-gray-700">
                    Sophisticated React-based web application combining computer vision AI concepts with blockchain certification for art authentication market. Implemented multi-phase rollout strategy with configurable views, comprehensive SEO targeting affluent art collectors, and conversion-optimized landing pages with analytics tracking and performance monitoring.
                  </p>
                </div>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Technical Architecture
                  </h4>
                  <p className="text-gray-700">
                    React 18.2.0 with component-driven architecture, Firebase authentication and Firestore NoSQL database, responsive design with accessibility compliance (ARIA), structured data implementation (Schema.org), Google Analytics 4 integration, and modular codebase following best practices with proper separation of concerns.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">AI Art Authentication</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Blockchain Concepts</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">React 18</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Firebase</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">SEO Strategy</span>
                </div>
              </div>
            </div>

            {/* Lowrys.org - AI-Enhanced Workforce Analytics */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="lowrys-platform">
              <div className="h-64 bg-gradient-to-br from-blue-50 to-cyan-100 relative overflow-hidden">
                <Image 
                  src="/images/Lowrys.org.png" 
                  alt="Lowrys.org - AI-Enhanced Workforce Analytics Platform Dashboard" 
                  width={600} 
                  height={256}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-90 hover:opacity-100 transition-opacity"
                  unoptimized={true}
                />
                <div className="absolute top-4 right-4">
                  <a 
                    href="/demo" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-300 flex items-center gap-2 shadow-lg"
                  >
                    <FaExternalLinkAlt className="text-sm" />
                    View Demo
                  </a>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Lowrys.org - AI-Enhanced Workforce Analytics Platform</h3>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaChartLine className="mr-2" /> Predictive Analytics & Data Intelligence
                  </h4>
                  <p className="text-gray-700">
                    Advanced predictive analytics platform with workforce attrition forecasting models, automated BLS data processing of 50,000+ occupation records, Chart.js and React-Globe.gl data visualizations, and AI-driven user experience with intelligent search and categorization. Features business intelligence dashboards and self-updating trend analysis.
                  </p>
                </div>
                <div className="mb-6 bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-500">
                  <h4 className="flex items-center text-cyan-700 font-semibold mb-2">
                    <FaServer className="mr-2" /> Enterprise Architecture
                  </h4>
                  <p className="text-gray-700">
                    Next.js 15 with TypeScript, Turso/LibSQL distributed database, Firebase ecosystem (Authentication, Firestore, Cloud Functions, Messaging), complex SQL queries with hierarchical data processing, ETL pipelines for government datasets, real-time data synchronization, and Vercel deployment with CI/CD automation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Predictive Analytics</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">BLS Data Processing</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Next.js 15</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Turso Database</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Data Visualization</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Enterprise Foundation Projects */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <FaChartLine className="text-blue-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">Enterprise Foundation Experience</h2>
          </div>
          <div className="text-center mb-12">
            <p className="text-lg max-w-4xl mx-auto text-gray-700">
              $50M+ portfolio management experience across 7 years in critical infrastructure environments provided the business analysis, stakeholder management, and enterprise delivery expertise that ensures current AI solutions meet real-world business requirements and deliver measurable value. <a href="/hobbies" className="text-blue-600 hover:text-blue-800 underline font-medium">Additional technical interests and personal projects</a> showcase the curiosity and hands-on learning that drive continuous innovation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Enterprise OT Cybersecurity Infrastructure Program */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1 md:col-span-2" id="ot-cybersecurity-program">
              <div className="h-64 bg-gradient-to-br from-red-50 to-orange-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-red-500">
                  <FaShieldAlt className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Enterprise OT Cybersecurity Infrastructure Program</h3>
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Critical infrastructure organization with 30+ generation facilities faced multiple cybersecurity challenges: lack of asset visibility across industrial networks, IT/OT convergence risks, legacy system vulnerabilities, manual patch management processes, overwhelming vulnerability alerts without prioritization, limited OT cybersecurity expertise, and ineffective incident response capabilities.
                  </p>
                </div>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Led a comprehensive 4-year, $15M enterprise cybersecurity program implementing industrial cybersecurity infrastructure across diverse generation environments. Managed complex stakeholder coordination with each facility having unique operational constraints, downtime windows, and regulatory requirements. Executed strategic 3-phase approach: Central management infrastructure (Phase 1), non-regulatory facilities deployment (Phase 2), and regulatory-sensitive facilities implementation (Phase 3).
                  </p>
                </div>
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Successfully delivered $15M program on schedule across 4-year timeline with zero operational disruptions. Coordinated 30+ facility teams with diverse operational requirements. Achieved enterprise-wide asset visibility, automated patch management, centralized incident response capabilities, and bridged IT/OT security gaps across all generation environments.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">Program Management</span>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">OT Cybersecurity</span>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">Critical Infrastructure</span>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">Stakeholder Management</span>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">Risk Management</span>
                </div>
              </div>
            </div>
            
            {/* OT Network Visibility & Threat Detection Modernization Program */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1 md:col-span-2" id="ot-network-modernization">
              <div className="h-64 bg-gradient-to-br from-orange-50 to-red-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                  <FaNetworkWired className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">OT Network Visibility & Threat Detection Modernization Program</h3>
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Legacy network observables across 30+ generation facilities provided insufficient visibility into OT network traffic and limited threat detection capabilities. Organization needed modern network monitoring and intrusion detection systems to enhance cybersecurity posture and meet evolving security requirements.
                  </p>
                </div>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Led a comprehensive 3-year, $7M infrastructure modernization program replacing legacy network observables with advanced OT intrusion detection systems and Gigamon network visibility solutions. Managed complex technology transitions across diverse generation environments while maintaining continuous network monitoring and operational security.
                  </p>
                </div>
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Successfully delivered $7M program across 3-year timeline with enhanced threat detection capabilities, improved network visibility across all OT environments, and modernized cybersecurity infrastructure foundation. Achieved seamless technology transitions without compromising operational monitoring or security posture.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">Infrastructure Modernization</span>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">Network Security</span>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">Threat Detection</span>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">Technology Migration</span>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">Program Management</span>
                </div>
              </div>
            </div>
            
            {/* Existing professional projects continue below */}
            {/* Enterprise Data Unification Initiative */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="enterprise-data-unification">
              <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                  <FaDatabase className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Enterprise Data Unification Initiative</h3>
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Organization struggled with fragmented data across multiple systems, inconsistent naming conventions, and data quality issues that impacted analytics and reporting accuracy.
                  </p>
                </div>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Built a unified data architecture using Power Query (M) and Power BI, with a two-tier development and deployment system that filtered bad data, created accountability, and established a single source of truth for analytics and business intelligence.
                  </p>
                </div>
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Enabled visibility into previously unavailable data, built stakeholder trust, and established a culture of data ownership. Reduced reporting time by 65% and improved analytics-driven decision accuracy by 40%.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Power Query (M)</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Power BI</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Data Integration</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Data Governance</span>
                </div>
              </div>
            </div>
            
            {/* Proactive Resource Management System */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="resource-management">
              <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                  <FaChartLine className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Proactive Resource Management System</h3>
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Resource conflicts and project delays due to lack of early visibility into dependencies across business services.
                  </p>
                </div>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Integrated business planning and project management data using Power Platform tools, automating early notifications and resource tracking for better project outcomes.
                  </p>
                </div>
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Accelerated development timelines by 35%, enabled early discovery of dependencies, and reduced project delays by 70%—demonstrating the value of analytics-driven automation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Power Platform</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Process Automation</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Resource Planning</span>
                </div>
              </div>
            </div>
            
            {/* Red Project Report */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-green-500">
                  <FaChartBar className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Red Project Report</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Portfolio managers lacked timely visibility into the status of multiple projects under their supervision, resulting in delayed interventions and missed deadlines.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Implemented an automated reporting system that identified projects with metrics in the &quot;red&quot; zone requiring immediate attention, with daily updates and executive dashboards.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Enabled proactive management of at-risk projects, eliminated 15 hours of weekly manual reporting efforts, and improved executive decision-making, resulting in 28% fewer project overruns.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Automated Reporting</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Performance Monitoring</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Portfolio Management</span>
                </div>
              </div>
            </div>
            
            {/* Project Phase Checklist */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-green-500">
                  <FaProjectDiagram className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Project Phase Checklist</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Projects moved between lifecycle phases without completing required deliverables, leading to quality issues, rework, and increased annual cost.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Created an automated governance system that tracked required deliverables and flagged incomplete items during phase transitions, with integrated approval workflows and documentation.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Ensured adherence to methodology standards, reduced rework, and increased stakeholder confidence in delivery processes, resulting in annual savings.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Project Governance</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Quality Assurance</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Process Automation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Leverage AI Solutions Architecture for Your Business?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Three commercial-grade AI platforms demonstrating mastery of strategic AI collaboration and multi-agent architecture, backed by $50M+ enterprise portfolio management experience. Expert in translating complex business requirements into accelerated AI solutions that deliver measurable outcomes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
              Discuss AI Solutions
            </a>
            <a href="https://seo.lowrys.org" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition duration-300">
              Experience AI SEO Platform
            </a>
            <a href="/skills" className="bg-transparent hover:bg-white hover:text-blue-600 text-white px-8 py-3 border border-white rounded-lg font-medium transition duration-300">
              View AI Skills
            </a>
            <a href="/hobbies" className="bg-transparent hover:bg-white hover:text-blue-600 text-white px-6 py-2 border border-white rounded-lg font-light text-sm transition duration-300">
              Technical Interests
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}