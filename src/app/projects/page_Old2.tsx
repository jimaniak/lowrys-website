'use client';

import Layout from '@/components/Layout';
import Image from 'next/image';
import { FaChartBar, FaCode, FaTools, FaExternalLinkAlt } from 'react-icons/fa';

export default function Projects() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">My Projects</h1>
          <p className="text-xl max-w-3xl">
            Explore a selection of my work across financial analysis, technical implementation, and hands-on projects.
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
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Financial & Analytical Projects</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Budget Optimization Model */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 relative">
                {/* Placeholder for Budget Allocation Chart */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Project Image
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Budget Optimization Model</h3>
                <p className="text-gray-600 mb-4">
                  Developed a comprehensive Excel model for budget optimization that helped identify cost-saving opportunities and improve financial performance.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Excel</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Financial Analysis</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Data Modeling</span>
                </div>
                <a href="#" className="inline-flex items-center text-blue-600 hover:underline">
                  View Details <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </div>
            </div>
            
            {/* Financial Forecasting Dashboard */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 relative">
                {/* Placeholder for Phase Duration Chart */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Project Image
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Financial Forecasting Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Created an interactive dashboard for financial forecasting that provided actionable insights and improved decision-making processes.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Power BI</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Data Visualization</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Financial Analysis</span>
                </div>
                <a href="#" className="inline-flex items-center text-blue-600 hover:underline">
                  View Details <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical & Digital Projects */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Technical & Digital Projects</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Workflow Automation Solution */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Project Image
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Workflow Automation Solution</h3>
                <p className="text-gray-600 mb-4">
                  Implemented a custom workflow automation that streamlined approval processes, reducing processing time by 40% and enhancing accuracy.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Process Automation</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">System Integration</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Workflow Design</span>
                </div>
                <a href="#" className="inline-flex items-center text-blue-600 hover:underline">
                  View Details <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </div>
            </div>
            
            {/* Custom PowerApp Solution */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Project Image
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Custom PowerApp Solution</h3>
                <p className="text-gray-600 mb-4">
                  Developed a custom PowerApp solution that simplified data collection and reporting, enhancing team productivity and data accuracy.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">PowerApps</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">App Development</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Data Management</span>
                </div>
                <a href="#" className="inline-flex items-center text-blue-600 hover:underline">
                  View Details <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hands-on Projects */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Hands-on Projects</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Custom Kitchen Renovation */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Project Image
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Custom Kitchen Renovation</h3>
                <p className="text-gray-600 mb-4">
                  Designed and built custom cabinetry for a complete kitchen renovation, combining aesthetic requirements with functional storage solutions.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">Carpentry</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">Design</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">Woodworking</span>
                </div>
                <a href="#" className="inline-flex items-center text-blue-600 hover:underline">
                  View Details <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </div>
            </div>
            
            {/* Home Electrical Upgrade */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Project Image
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Home Electrical Upgrade</h3>
                <p className="text-gray-600 mb-4">
                  Completed a comprehensive electrical system upgrade for a residential property, improving safety and energy efficiency.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">Electrical</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">Safety</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">Wiring</span>
                </div>
                <a href="#" className="inline-flex items-center text-blue-600 hover:underline">
                  View Details <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Interested in Working Together?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            I'm available for consulting, project work, and full-time opportunities across my areas of expertise.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300"
          >
            Contact Me
          </a>
        </div>
      </section>
    </Layout>
  );
}
