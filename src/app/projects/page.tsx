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
          <h1 className="text-5xl font-bold mb-6 leading-tight">My Projects</h1>
          <p className="text-xl max-w-3xl leading-relaxed">
            Explore how I transform business challenges into effective solutions through data integration, workflow automation, and innovative technology approaches. Also discover my personal technical projects that demonstrate my practical implementation skills and technical versatility.
          </p>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Featured Work</h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto">
            These projects demonstrate my ability to deliver comprehensive solutions by leveraging my diverse skill set across multiple domains, from business environments to personal technical challenges.
          </p>
        </div>
      </section>

      {/* Financial & Analytical Projects */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <FaChartLine className="text-blue-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">Financial & Analytical Projects</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
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
                    Organization struggled with fragmented data across multiple systems, inconsistent naming conventions, and data quality issues that impacted decision-making and reporting accuracy.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Created a unified data architecture with an innovative two-tier development and deployment system that filtered bad data, created accountability, and established a single source of truth for business intelligence.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Built exceptional stakeholder trust, enabled visibility into previously unavailable data, and established a culture of data ownership. Reduced reporting time by 65% and improved decision accuracy by 40%.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Data Integration</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Data Governance</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Process Improvement</span>
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
                    Over 30 dependent business services weren&apos;t notified of project dependencies until urgent deadlines approached, causing resource conflicts and project delays.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Developed integration between business planning and project management systems that automatically created entries in an Automated Work Log at early planning stages, providing 60-90 day advance notice of resource needs.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Accelerated development timelines by 35%, enabled early discovery of dependencies, and reduced project delays due to resource constraints by 70%, resulting in significant cost savings.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Resource Planning</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Process Automation</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Cross-functional Collaboration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical & Digital Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <FaCode className="text-green-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">Technical & Digital Projects</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* AIrtisan.net Web Platform Project */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="airtisan-platform">
              <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-green-500">
                  <FaCode className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">AI-Enhanced Web Platform Development</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Develop a modern, responsive web platform that showcases professional services while implementing cutting-edge technologies and SEO best practices to maximize online visibility and user engagement.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Created AIrtisan.net using Next.js and React, leveraging AI collaboration for enhanced development efficiency. Implemented advanced SEO optimization, responsive design, and structured data markup to ensure cross-device compatibility and search visibility.
                  </p>
                </div>
                
                {/* Add AIrtisan.net Screenshot as a clickable link */}
                <div className="my-4">
                  <Link 
                    href="https://airtisan.net" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mx-auto w-fit"
                  >
                    <Image 
                      src="/images/projects/web-development/airtisan-platform.png" 
                      alt="AIrtisan.net web platform showcasing AI-enhanced development techniques" 
                      width={600} 
                      height={400} 
                      className="rounded-lg shadow-md mx-auto hover:opacity-90 transition-opacity cursor-pointer"
                      unoptimized={true}
                    />
                  </Link>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Delivered a high-performance web platform with 90+ PageSpeed scores, optimized SEO architecture, and seamless user experience across all devices. The AI-assisted development process reduced implementation time by 40% while maintaining code quality and best practices.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Next.js</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">React</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">AI Development</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">SEO Optimization</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Responsive Design</span>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <a 
                    href="https://airtisan.net" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    View Project <span className="ml-2">→</span>
                  </a>
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

      {/* AI-Enhanced Solutions */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <FaRobot className="text-purple-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">AI-Enhanced Solutions</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 md:mx-auto md:max-w-4xl">
            {/* AI-Powered Technical Solution Development */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden md:col-span-2 transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="ai-solutions">
              <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-purple-500">
                  <FaRobot className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">AI-Powered Technical Solution Development</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Modern technical solutions require expertise across diverse technologies that&apos;s impossible for one person to master, creating bottlenecks in development and implementation.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Pioneered an approach leveraging AI tools to augment technical capabilities across multiple domains, creating a framework for rapid solution development and implementation.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Accelerated development timelines by 40-60%, delivered sophisticated solutions with fewer resources, and expanded capabilities beyond traditional boundaries, enabling faster time-to-market for technical initiatives.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">AI Integration</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Technical Versatility</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Innovative Problem-Solving</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Infrastructure Projects */}
      <section className="py-16 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <FaNetworkWired className="text-cyan-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">Technical Infrastructure Projects</h2>
          </div>
          
          <p className="text-lg text-center mb-12 max-w-3xl mx-auto">
            These projects demonstrate how I apply enterprise-level architecture, security, and integration principles in practical implementations, showcasing my technical versatility beyond traditional business environments.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Enterprise-Grade Home Network */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="home-network">
              <div className="h-64 bg-gradient-to-br from-cyan-50 to-cyan-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-cyan-500">
                  <FaNetworkWired className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Enterprise-Grade Home Network</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Modern home environments require enterprise-level network security, reliability, and performance to support multiple connected systems and devices with redundancy for critical services.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Designed and implemented a semi-commercial network infrastructure using professional-grade Ubiquiti equipment including a UDM-Pro (Iron Curtain), multiple managed switches (24-port and 8-port POE), and dedicated WiFi access points, complemented by additional non-UniFi endpoint switches.
                  </p>
                </div>
                {/* Add the NetworkTraffic GIF here */}
                <div className="my-4">
                  <Image 
                    src="/images/projects/technical-infrastructure/NetworkTraffic.gif"
                    alt="Live network traffic visualization showing data flow through enterprise-grade home network" 
                    width={600} 
                    height={400} 
                    className="rounded-lg shadow-md mx-auto"
                    unoptimized={true}
                  />
                </div>
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Created a robust foundation with 1Gbps fiber primary connection and 400Mbps LTE failover, enabling reliable connectivity for home automation, secure remote work, and demonstrating enterprise architecture principles in a residential context.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Network Architecture</span>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Security Implementation</span>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Redundancy Planning</span>
                </div>
              </div>
            </div>
            
            {/* Integrated Smart Home Automation */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-64 bg-gradient-to-br from-cyan-50 to-cyan-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-cyan-500">
                  <FaHome className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Integrated Smart Home Automation</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Creating a truly intelligent home environment requires complex integration between disparate systems and contextual awareness for meaningful automation with advanced security features.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Implemented a comprehensive Home Assistant automation system integrating security cameras, environmental controls, and monitoring with centralized management and advanced conditional logic.
                  </p>
                </div>
                
                {/* Add the HomeAutomation image here */}
                <div className="my-4">
                  <Image 
                    src="/images/projects/technical-infrastructure/HomeAutomation.png"
                    alt="Integrated home automation system architecture showing component relationships and data flow" 
                    width={600} 
                    height={400} 
                    className="rounded-lg shadow-md mx-auto"
                    unoptimized={true}
                  />
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Achieved 30% energy savings, enhanced security with multi-layered protection, and demonstrated scalable integration principles applicable to commercial environments.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Systems Integration</span>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Automation Logic</span>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Energy Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Workshop Projects */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <FaTools className="text-amber-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">Personal Workshop Projects</h2>
          </div>
          
          <p className="text-lg text-center mb-12 max-w-3xl mx-auto">
            These hands-on projects showcase my practical problem-solving abilities and technical implementation skills, demonstrating how I approach complex challenges with creativity and attention to detail.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Laundry Room Rebuild */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="laundry-room">
              <div className="h-64 bg-gradient-to-br from-amber-50 to-amber-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                  <FaWrench className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Laundry Room Rebuild</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Outdated laundry room with inefficient layout, inadequate storage, and outdated electrical systems needed complete renovation while maintaining functionality during the rebuild process.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Designed and implemented a complete renovation including custom cabinetry, updated electrical work with dedicated circuits, improved plumbing, and integrated smart home features for monitoring and alerts.
                  </p>
                </div>
                
                {/* Add the LaundryRoomTransformation GIF here */}
                <div className="my-4">
                  <Image 
                    src="/images/projects/technical-infrastructure/LaundryRoomTransformation.gif"
                    alt="Before and after transformation of laundry room showing complete renovation" 
                    width={600} 
                    height={400} 
                    className="rounded-lg shadow-md mx-auto"
                    unoptimized={true}
                  />
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Created a highly functional space with improved workflow, ample storage, and integrated technology that enhances safety through leak detection and power monitoring.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Custom Cabinetry</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Electrical Work</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Smart Home Integration</span>
                </div>
              </div>
            </div>
            
            {/* Garage Workshop Conversion - IN PROGRESS */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="garage-workshop">
              <div className="h-64 bg-gradient-to-br from-amber-50 to-amber-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                  <FaTools className="text-7xl opacity-40" />
                </div>
                {/* In Progress Badge */}
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  In Progress
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Garage Workshop Conversion</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Standard garage lacked the infrastructure, organization, and functionality needed for an efficient multi-purpose workshop, requiring significant electrical and storage upgrades.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Currently transforming the garage into a multi-functional space with enhanced electrical systems, custom storage solutions, and optimized workflow layout while maintaining parking functionality.
                  </p>
                </div>
                
                {/* Add Garage Workshop Transformation Journey */}
                <div className="my-4">
                  <Image 
                    src="/images/projects/technical-infrastructure/GarageTransformationJourney.png" 
                    alt="Garage workshop transformation journey showing beginning, current progress, and final vision" 
                    width={600} 
                    height={1200} 
                    className="rounded-lg shadow-md mx-auto"
                    unoptimized={true}
                  />
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Creating a versatile space that demonstrates space optimization, systems planning, and the ability to execute multiple functional requirements within physical constraints.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Workshop Design</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Custom Storage</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Workflow Optimization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Interested in Working Together?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you need business process optimization, technical implementation expertise, or creative problem-solving, let&apos;s discuss how my diverse skill set can benefit your organization or project.
          </p>
          <a href="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
            Get in Touch
          </a>
        </div>
      </section>
    </main>
  );
}