'use client';

import Link from 'next/link';
import { useState } from 'react';
import { INDUSTRY_CONFIGS, IndustryType } from './types';

export default function SEOIntakeLanding() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  // Featured industries (most common clients)
  const featuredIndustries = ['pest-control', 'hvac', 'plumbing'] as IndustryType[];
  
  // All available industries for dropdown
  const allIndustries = [
    'Accounting', 'Auto Repair', 'Chiropractor', 'Cleaning Services', 'Construction',
    'Dental', 'Electrician', 'Financial Services', 'Fitness', 'Hair Salon',
    'Insurance', 'Landscaping', 'Law Firm', 'Medical', 'Photography',
    'Real Estate', 'Restaurant', 'Roofing', 'Solar', 'Veterinary'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            SEO Intake Form
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get a customized SEO strategy for your business. Choose your industry below to get started.
          </p>
        </div>

        {/* Featured Industries */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Popular Industries</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredIndustries.map((key) => {
              const config = INDUSTRY_CONFIGS[key];
              return (
                <Link 
                  key={key} 
                  href={`/seo-intake-form/${key}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100"
                >
                  <div className="text-center">
                    {/* Industry Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      {key === 'pest-control' && (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      {key === 'hvac' && (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                      {key === 'plumbing' && (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {config.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-6">
                      Specialized intake form designed for {config.name.toLowerCase()} companies with 
                      industry-specific questions and service options.
                    </p>
                    
                    <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                      Start Intake Form
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Industry Dropdown */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Or Choose Your Industry
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Select from hundreds of business categories based on Bureau of Labor Statistics data
          </p>
          
          <div className="max-w-md mx-auto">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">Select your industry...</option>
              {allIndustries.map((industry) => (
                <option key={industry} value={industry.toLowerCase().replace(/\s+/g, '-')}>
                  {industry}
                </option>
              ))}
            </select>
            
            {selectedIndustry && (
              <div className="mt-4 text-center">
                <Link
                  href={`/seo-intake-form/${selectedIndustry}`}
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start {selectedIndustry.replace(/-/g, ' ')} Form
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-gray-600 mb-6">
            Not sure which form is right for you? Give us a call and we'll help you get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="tel:636-237-1341" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Call (636) 237-1341
            </a>
            <a 
              href="mailto:Jim@Lowrys.org" 
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Email Jim@Lowrys.org
            </a>
          </div>
        </div>

        {/* General Form Option */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Need a completely custom approach?
          </p>
          <Link 
            href="/seo-intake-form/general"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            Use General Intake Form
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
