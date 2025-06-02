'use client';

import Layout from '@/components/Layout';
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { FaFileExcel, FaGoogleDrive, FaDownload, FaLock, FaFileAlt, FaChartBar, FaTools, FaClipboardCheck, FaArrowRight, FaEnvelope, FaCheckCircle, FaClock } from 'react-icons/fa';

// SEO metadata component
const ResourcesMetadata = () => {
  return (
    <Head>
      <title>Business Resources & Templates | Jim Lowry</title>
      <meta name="description" content="Access free business templates, assessments, and tools created by Jim Lowry, Business Solutions Consultant. Download professional resources to improve your business operations." />
      <meta name="keywords" content="business resources, process templates, business assessment tools, free business downloads, Jim Lowry" />
      <meta property="og:title" content="Business Resources & Templates | Jim Lowry" />
      <meta property="og:description" content="Access free business templates, assessments, and tools created by Jim Lowry, Business Solutions Consultant." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.lowrys.org/resources" />
      <link rel="canonical" href="https://www.lowrys.org/resources" />
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "headline": "Business Resources & Templates",
            "description": "Access free business templates, assessments, and tools created by Jim Lowry, Business Solutions Consultant.",
            "author": {
              "@type": "Person",
              "name": "Jim Lowry",
              "jobTitle": "Business Solutions Consultant"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          }
        `}
      </script>
    </Head>
  );
};

// Resource card component
interface ResourceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  downloadUrl?: string;
  isGated?: boolean;
  format: string;
  comingSoon?: boolean;
}

const ResourceCard = ({ title, description, icon, downloadUrl, isGated = false, format, comingSoon = false }: ResourceCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the data to your backend
    // and then either redirect to the download or email the resource
    console.log('Resource requested:', { name, email, resource: title });
    setSubmitted(true);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Format: {format}</span>
        
        {comingSoon ? (
          <span className="flex items-center text-amber-600">
            <FaClock className="mr-2" /> Coming Soon
          </span>
        ) : isGated ? (
          <div>
            {!showForm && !submitted ? (
              <button 
                onClick={() => setShowForm(true)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaLock className="mr-2" /> Request Access
              </button>
            ) : submitted ? (
              <span className="text-green-600 flex items-center">
                <FaEnvelope className="mr-2" /> Check your email
              </span>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                  <label htmlFor={`name-${title}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id={`name-${title}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor={`email-${title}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id={`email-${title}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                  >
                    Submit
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded border border-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <a 
            href={downloadUrl} 
            className="flex items-center text-blue-600 hover:text-blue-800"
            download
          >
            <FaDownload className="mr-2" /> Download
          </a>
        )}
      </div>
    </div>
  );
};

export default function Resources() {
  return (
    <Layout>
      <ResourcesMetadata />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Business Resources</h1>
          <p className="text-xl max-w-3xl leading-relaxed">
            Access professional templates, assessments, and tools designed to help you optimize your business processes and improve operational efficiency. From quick-start templates to comprehensive assessment tools, these resources reflect my approach to solving complex business challenges.
          </p>
        </div>
      </section>
      
      {/* Featured Resource Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Resource</h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="md:flex">
              <div className="md:w-1/3 bg-blue-600 text-white p-8 flex flex-col justify-center">
                <div className="text-center mb-6">
                  <FaChartBar className="text-6xl mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Business Process Health Assessment</h3>
                </div>
                <p className="text-blue-100">
                  Evaluate the efficiency and effectiveness of your business processes with this comprehensive assessment tool.
                </p>
              </div>
              
              <div className="md:w-2/3 p-8">
                <h4 className="text-xl font-semibold mb-4">What's included:</h4>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Process maturity evaluation framework</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Efficiency and effectiveness metrics</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Automated scoring and visualization</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Improvement recommendations</span>
                  </li>
                </ul>
                
                <div className="flex flex-wrap gap-4">
                  <a 
                    href="/documents/business-process-health-assessment.xlsx" 
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                    download
                  >
                    <FaFileExcel className="mr-2" /> Download Excel Version
                  </a>
                  
                  <a 
                    href="https://docs.google.com/spreadsheets/d/template-id/copy" 
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGoogleDrive className="mr-2" /> Use Google Sheets Version
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Resource Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Resource Library</h2>
          
          {/* Process Templates */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 border-b pb-2">Process Templates</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                title="Process Documentation Template"
                description="Standardize your process documentation with this comprehensive template designed for clarity and consistency."
                icon={<FaFileAlt className="text-blue-600 text-xl" />}
                comingSoon={true}
                format="Word Document"
              />
              
              <ResourceCard 
                title="Process Improvement Roadmap"
                description="A strategic planning tool for identifying, prioritizing, and implementing process improvements."
                icon={<FaTools className="text-blue-600 text-xl" />}
                isGated={true}
                comingSoon={true}
                format="Excel Spreadsheet"
              />
              
              <ResourceCard 
                title="Standard Operating Procedure (SOP) Template"
                description="Create clear, consistent SOPs that ensure operational excellence and reduce training time."
                icon={<FaClipboardCheck className="text-blue-600 text-xl" />}
                comingSoon={true}
                format="Word Document"
              />
            </div>
          </div>
          
          {/* Analysis Tools */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 border-b pb-2">Analysis Tools</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                title="Process Efficiency Calculator"
                description="Quantify the efficiency of your business processes with this data-driven analysis tool."
                icon={<FaChartBar className="text-blue-600 text-xl" />}
                isGated={true}
                comingSoon={true}
                format="Excel Spreadsheet"
              />
              
              <ResourceCard 
                title="Root Cause Analysis Worksheet"
                description="Identify the underlying causes of business problems with this structured analysis approach."
                icon={<FaTools className="text-blue-600 text-xl" />}
                comingSoon={true}
                format="PDF Document"
              />
              
              <ResourceCard 
                title="Process Mapping Toolkit"
                description="Visualize and optimize your business processes with this comprehensive mapping toolkit."
                icon={<FaFileAlt className="text-blue-600 text-xl" />}
                isGated={true}
                comingSoon={true}
                format="PowerPoint Template"
              />
            </div>
          </div>
          
          {/* Implementation Guides */}
          <div>
            <h3 className="text-2xl font-bold mb-6 border-b pb-2">Implementation Guides</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                title="Change Management Playbook"
                description="Successfully implement process changes with this comprehensive change management guide."
                icon={<FaFileAlt className="text-blue-600 text-xl" />}
                isGated={true}
                comingSoon={true}
                format="PDF Document"
              />
              
              <ResourceCard 
                title="Process Automation Checklist"
                description="Identify automation opportunities and prepare for successful implementation with this checklist."
                icon={<FaClipboardCheck className="text-blue-600 text-xl" />}
                comingSoon={true}
                format="PDF Document"
              />
              
              <ResourceCard 
                title="Implementation Planning Template"
                description="Plan your process improvement implementation with this structured template for success."
                icon={<FaTools className="text-blue-600 text-xl" />}
                comingSoon={true}
                format="Excel Spreadsheet"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Custom Solutions?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            These resources provide a starting point, but every business has unique challenges. Contact me for personalized consulting and solutions tailored to your specific needs.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition"
          >
            Get in Touch <FaArrowRight className="ml-2" />
          </a>
        </div>
      </section>
    </Layout>
  );
}
