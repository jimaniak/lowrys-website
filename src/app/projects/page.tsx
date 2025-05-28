'use client';

import Layout from '@/components/Layout';
import Image from 'next/image';
import { FaExternalLinkAlt } from 'react-icons/fa';

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

      {/* Projects Introduction */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Featured Work</h2>
            <p className="text-lg mb-8">
              These projects demonstrate my ability to deliver comprehensive solutions by leveraging my diverse skill set across multiple domains.
            </p>
          </div>
        </div>
      </section>

      {/* Financial & Analytical Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Financial & Analytical Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Project Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Budget Optimization Model</h3>
                <p className="text-gray-600 mb-4">
                  Developed a comprehensive Excel model for budget optimization that helped identify cost-saving opportunities and improve financial performance.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Excel</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Financial Analysis</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Data Modeling</span>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                  <span>View Details</span>
                  <FaExternalLinkAlt size={14} />
                </a>
              </div>
            </div>
            
            {/* Project 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Project Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Financial Forecasting Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Created an interactive dashboard for financial forecasting that provided actionable insights and improved decision-making processes.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Power BI</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Data Visualization</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Financial Analysis</span>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                  <span>View Details</span>
                  <FaExternalLinkAlt size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical & Digital Projects */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Technical & Digital Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Project Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Workflow Automation Solution</h3>
                <p className="text-gray-600 mb-4">
                  Implemented a Power Automate workflow that streamlined approval processes, reducing processing time by 60% and improving accuracy.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Power Automate</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Process Automation</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Workflow Design</span>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                  <span>View Details</span>
                  <FaExternalLinkAlt size={14} />
                </a>
              </div>
            </div>
            
            {/* Project 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Project Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Custom PowerApp Solution</h3>
                <p className="text-gray-600 mb-4">
                  Developed a custom PowerApp that simplified data collection and reporting, enhancing team productivity and data accuracy.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">PowerApps</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">App Development</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Data Management</span>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                  <span>View Details</span>
                  <FaExternalLinkAlt size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hands-on Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Hands-on Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Project Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Custom Kitchen Renovation</h3>
                <p className="text-gray-600 mb-4">
                  Designed and built custom cabinetry for a complete kitchen renovation, combining aesthetic appeal with functional storage solutions.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Cabinetry</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Woodworking</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Design</span>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                  <span>View Details</span>
                  <FaExternalLinkAlt size={14} />
                </a>
              </div>
            </div>
            
            {/* Project 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Project Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Home Electrical Upgrade</h3>
                <p className="text-gray-600 mb-4">
                  Completed a comprehensive electrical system upgrade for a residential property, improving safety and energy efficiency.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Electrical</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Installation</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Safety</span>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                  <span>View Details</span>
                  <FaExternalLinkAlt size={14} />
                </a>
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
            I&apos;m available for consulting, project work, and full-time opportunities across my areas of expertise.
          </p>
          <a href="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
            Contact Me
          </a>
        </div>
      </section>
    </Layout>
  );
}
