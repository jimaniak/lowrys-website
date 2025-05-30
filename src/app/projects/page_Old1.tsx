'use client';

import Layout from '@/components/Layout';
import Image from 'next/image';
import { FaChartBar, FaCode, FaTools, FaExternalLinkAlt, FaDatabase, FaProjectDiagram, FaRobot, FaChartLine, FaLightbulb, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function Projects() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">My Projects</h1>
          <p className="text-xl max-w-3xl leading-relaxed">
            Explore how I transform business challenges into effective solutions through data integration, workflow automation, and innovative technology approaches. The selected projects below represent a small sample of my work, chosen to illustrate my approach to solving complex business challenges.
          </p>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Featured Work</h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto">
            These projects demonstrate my ability to deliver comprehensive solutions by leveraging my diverse skill set across multiple domains.
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
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
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
                    Organization struggled with fragmented data across multiple systems, inconsistent naming conventions, and data quality issues.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Created a unified data architecture with an innovative two-tier development and deployment system that filtered bad data and created accountability.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Built exceptional stakeholder trust, enabled visibility into previously unavailable data, and established a culture of data ownership.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Data Integration</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Data Governance</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Process Improvement</span>
                </div>
                
                <a href="#" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors">
                  View Details <FaArrowRight className="ml-2" />
                </a>
              </div>
            </div>
            
            {/* Proactive Resource Management System */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
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
                    Over 30 dependent business services weren&apos;t notified of project dependencies until urgent deadlines approached.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Developed integration between business planning and project management that automatically created entries in an Automated Work Log at early planning stages.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Accelerated development timelines, enabled early discovery of dependencies, and reduced project delays due to resource constraints.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Resource Planning</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Process Automation</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Cross-functional Collaboration</span>
                </div>
                
                <a href="#" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors">
                  View Details <FaArrowRight className="ml-2" />
                </a>
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
                    Portfolio managers lacked timely visibility into the status of multiple projects under their supervision.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Implemented an automated reporting system that identified projects with metrics in the &quot;red&quot; zone requiring immediate attention.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Enabled proactive management of at-risk projects, eliminated manual reporting efforts, and improved decision-making.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Automated Reporting</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Performance Monitoring</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Portfolio Management</span>
                </div>
                
                <a href="#" className="inline-flex items-center text-green-600 font-medium hover:text-green-800 transition-colors">
                  View Details <FaArrowRight className="ml-2" />
                </a>
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
                    Projects moved between lifecycle phases without completing required deliverables, leading to quality issues and rework.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Created an automated governance system that tracked required deliverables and flagged incomplete items during phase transitions.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Ensured adherence to methodology standards, reduced rework, and increased stakeholder confidence in delivery processes.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Project Governance</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Quality Assurance</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Process Automation</span>
                </div>
                
                <a href="#" className="inline-flex items-center text-green-600 font-medium hover:text-green-800 transition-colors">
                  View Details <FaArrowRight className="ml-2" />
                </a>
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
            <div className="bg-white rounded-lg shadow-lg overflow-hidden md:col-span-2 transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
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
                    Modern technical solutions require expertise across diverse technologies that&apos;s impossible for one person to master.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Pioneered an approach leveraging AI tools to augment technical capabilities across multiple domains.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Impact
                  </h4>
                  <p className="text-gray-700">
                    Accelerated development timelines, delivered sophisticated solutions with fewer resources, and expanded capabilities beyond traditional boundaries.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">AI Integration</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Technical Versatility</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Innovative Problem-Solving</span>
                </div>
                
                <a href="#" className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800 transition-colors">
                  View Details <FaArrowRight className="ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hands-on Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <FaTools className="text-amber-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">Hands-on Projects</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Custom Kitchen Renovation */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-64 bg-gradient-to-br from-amber-50 to-amber-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                  <FaTools className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Custom Kitchen Renovation</h3>
                <p className="text-gray-700 mb-6">
                  Designed and built custom cabinetry for a complete kitchen renovation, combining aesthetic requirements with functional storage solutions.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Carpentry</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Design</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Woodworking</span>
                </div>
                <a href="#" className="inline-flex items-center text-amber-600 font-medium hover:text-amber-800 transition-colors">
                  View Details <FaArrowRight className="ml-2" />
                </a>
              </div>
            </div>
            
            {/* Home Electrical Upgrade */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-64 bg-gradient-to-br from-amber-50 to-amber-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                  <FaTools className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Home Electrical Upgrade</h3>
                <p className="text-gray-700 mb-6">
                  Completed a comprehensive electrical system upgrade for a residential property, improving safety and energy efficiency.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Electrical</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Safety</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Wiring</span>
                </div>
                <a href="#" className="inline-flex items-center text-amber-600 font-medium hover:text-amber-800 transition-colors">
                  View Details <FaArrowRight className="ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Interested in Working Together?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            I&apos;m available for consulting, project work, and full-time opportunities across my areas of expertise.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors transform hover:scale-105 duration-300"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </Layout>
  );
}
