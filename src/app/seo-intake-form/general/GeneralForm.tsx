'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { FormData } from '../types';

export default function GeneralForm() {
  const searchParams = useSearchParams();
  const preselectedIndustry = searchParams.get('industry') || '';
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    bestTime: '',
    website: '',
    yearsInBusiness: '',
    services: [],
    serviceAreas: '',
    competitors: '',
    currentSeoProvider: '',
    monthlySeoInvestment: '',
    currentSeoWork: [],
    websitePlatform: '',
    adminAccess: '',
    googleAccounts: [],
    primaryGoal: '',
    targetCustomers: '',
    customerValue: '',
    topServices: '',
    package: '',
    differentiators: '',
    commonQuestions: '',
    additionalInfo: '',
    industry: preselectedIndustry
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[name] as string[];
      const isChecked = currentArray.includes(value);
      
      if (isChecked) {
        return { ...prev, [name]: currentArray.filter(item => item !== value) };
      } else {
        return { ...prev, [name]: [...currentArray, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/seo-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          title: '',
          company: '',
          phone: '',
          email: '',
          bestTime: '',
          website: '',
          yearsInBusiness: '',
          services: [],
          serviceAreas: '',
          competitors: '',
          currentSeoProvider: '',
          monthlySeoInvestment: '',
          currentSeoWork: [],
          websitePlatform: '',
          adminAccess: '',
          googleAccounts: [],
          primaryGoal: '',
          targetCustomers: '',
          customerValue: '',
          topServices: '',
          package: '',
          differentiators: '',
          commonQuestions: '',
          additionalInfo: '',
          industry: preselectedIndustry
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              Your SEO intake form has been submitted successfully. We&apos;ll review your information and get back to you within 24 hours with a customized strategy for your {formData.industry} business.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> Check your email for a confirmation and our team will reach out to schedule your strategy session.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">SEO Strategy Intake Form</h1>
            {preselectedIndustry && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Industry Selected:</strong> {preselectedIndustry}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      This will help us provide industry-specific recommendations for your business.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-gray-600">
              Help us understand your business and current SEO situation so we can provide you with a customized strategy and recommendations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="bestTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Best Time to Contact
                  </label>
                  <select
                    id="bestTime"
                    name="bestTime"
                    value={formData.bestTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select preferred time</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL *
                  </label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    required
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="example.com or https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry/Business Type *
                  </label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    required
                    value={formData.industry}
                    onChange={handleInputChange}
                    readOnly={!!preselectedIndustry}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      preselectedIndustry ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business
                    </label>
                    <select
                      id="yearsInBusiness"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select range</option>
                      <option value="less-than-1">Less than 1 year</option>
                      <option value="1-2">1-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="11-20">11-20 years</option>
                      <option value="more-than-20">More than 20 years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Services (Check all that apply)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Residential Services',
                      'Commercial Services',
                      'Emergency Services',
                      'Maintenance/Ongoing',
                      'Consultation',
                      'Installation',
                      'Repair',
                      'Other'
                    ].map((service) => (
                      <label key={service} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service)}
                          onChange={() => handleCheckboxChange('services', service)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="serviceAreas" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Areas (Cities/Regions) *
                  </label>
                  <textarea
                    id="serviceAreas"
                    name="serviceAreas"
                    required
                    rows={3}
                    value={formData.serviceAreas}
                    onChange={handleInputChange}
                    placeholder="List the cities, counties, or regions you serve..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="competitors" className="block text-sm font-medium text-gray-700 mb-2">
                    Main Competitors (if known)
                  </label>
                  <textarea
                    id="competitors"
                    name="competitors"
                    rows={3}
                    value={formData.competitors}
                    onChange={handleInputChange}
                    placeholder="List any competitors you're aware of..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Current SEO Situation */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current SEO & Marketing</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentSeoProvider" className="block text-sm font-medium text-gray-700 mb-2">
                    Current SEO Provider (if any)
                  </label>
                  <input
                    type="text"
                    id="currentSeoProvider"
                    name="currentSeoProvider"
                    value={formData.currentSeoProvider}
                    onChange={handleInputChange}
                    placeholder="None, In-house, Company name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="monthlySeoInvestment" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Monthly SEO/Marketing Investment
                  </label>
                  <select
                    id="monthlySeoInvestment"
                    name="monthlySeoInvestment"
                    value={formData.monthlySeoInvestment}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select range</option>
                    <option value="0">$0 (No current investment)</option>
                    <option value="1-500">$1 - $500</option>
                    <option value="501-1000">$501 - $1,000</option>
                    <option value="1001-2500">$1,001 - $2,500</option>
                    <option value="2501-5000">$2,501 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current SEO/Marketing Activities (Check all that apply)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Google Ads',
                      'Facebook/Social Media Ads',
                      'SEO Services',
                      'Content Marketing',
                      'Local Directory Listings',
                      'Google My Business Management',
                      'Email Marketing',
                      'None of the above'
                    ].map((activity) => (
                      <label key={activity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.currentSeoWork.includes(activity)}
                          onChange={() => handleCheckboxChange('currentSeoWork', activity)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{activity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Website & Technical */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Website & Technical Information</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="websitePlatform" className="block text-sm font-medium text-gray-700 mb-2">
                    Website Platform
                  </label>
                  <select
                    id="websitePlatform"
                    name="websitePlatform"
                    value={formData.websitePlatform}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select platform</option>
                    <option value="wordpress">WordPress</option>
                    <option value="squarespace">Squarespace</option>
                    <option value="wix">Wix</option>
                    <option value="shopify">Shopify</option>
                    <option value="custom">Custom Built</option>
                    <option value="other">Other</option>
                    <option value="unknown">Not Sure</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="adminAccess" className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have admin access to your website?
                  </label>
                  <select
                    id="adminAccess"
                    name="adminAccess"
                    value={formData.adminAccess}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select option</option>
                    <option value="yes-full">Yes, full admin access</option>
                    <option value="yes-limited">Yes, limited access</option>
                    <option value="no">No admin access</option>
                    <option value="unsure">Not sure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Accounts (Check all that you have)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Google My Business',
                      'Google Analytics',
                      'Google Search Console',
                      'Google Ads',
                      'None of the above',
                      'Not sure what these are'
                    ].map((account) => (
                      <label key={account} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.googleAccounts.includes(account)}
                          onChange={() => handleCheckboxChange('googleAccounts', account)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{account}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Goals */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Goals & Strategy</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="primaryGoal" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Goal for SEO *
                  </label>
                  <select
                    id="primaryGoal"
                    name="primaryGoal"
                    required
                    value={formData.primaryGoal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select primary goal</option>
                    <option value="more-leads">Generate more leads/inquiries</option>
                    <option value="increase-revenue">Increase revenue</option>
                    <option value="brand-awareness">Improve brand awareness</option>
                    <option value="compete-better">Compete better online</option>
                    <option value="expand-market">Expand to new markets</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="targetCustomers" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Customer Description
                  </label>
                  <textarea
                    id="targetCustomers"
                    name="targetCustomers"
                    rows={3}
                    value={formData.targetCustomers}
                    onChange={handleInputChange}
                    placeholder="Describe your ideal customers (demographics, business types, etc.)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="customerValue" className="block text-sm font-medium text-gray-700 mb-2">
                    Average Customer Value
                  </label>
                  <select
                    id="customerValue"
                    name="customerValue"
                    value={formData.customerValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select range</option>
                    <option value="under-500">Under $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2500">$1,000 - $2,500</option>
                    <option value="2500-5000">$2,500 - $5,000</option>
                    <option value="5000-10000">$5,000 - $10,000</option>
                    <option value="over-10000">Over $10,000</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="topServices" className="block text-sm font-medium text-gray-700 mb-2">
                    Most Profitable Services
                  </label>
                  <textarea
                    id="topServices"
                    name="topServices"
                    rows={3}
                    value={formData.topServices}
                    onChange={handleInputChange}
                    placeholder="What services generate the most revenue for your business?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Package Interest */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Interest</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="package" className="block text-sm font-medium text-gray-700 mb-2">
                    Which service level interests you most?
                  </label>
                  <select
                    id="package"
                    name="package"
                    value={formData.package}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select package interest</option>
                    <option value="audit-only">SEO Audit Only ($497)</option>
                    <option value="local-starter">Local SEO Starter ($897/month)</option>
                    <option value="growth-accelerator">Growth Accelerator ($1,497/month)</option>
                    <option value="market-dominator">Market Dominator ($2,497/month)</option>
                    <option value="custom">Custom Solution</option>
                    <option value="consultation">Just want to learn more</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="differentiators" className="block text-sm font-medium text-gray-700 mb-2">
                    What makes your business different from competitors?
                  </label>
                  <textarea
                    id="differentiators"
                    name="differentiators"
                    rows={3}
                    value={formData.differentiators}
                    onChange={handleInputChange}
                    placeholder="Unique selling points, special services, awards, certifications, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="commonQuestions" className="block text-sm font-medium text-gray-700 mb-2">
                    Common Customer Questions/Concerns
                  </label>
                  <textarea
                    id="commonQuestions"
                    name="commonQuestions"
                    rows={3}
                    value={formData.commonQuestions}
                    onChange={handleInputChange}
                    placeholder="What questions do customers frequently ask? What concerns do they have?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Anything else you'd like us to know about your business, challenges, or goals?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg transition duration-200 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit SEO Intake Form'}
              </button>
              {submitStatus === 'error' && (
                <p className="mt-2 text-red-600 text-sm">
                  There was an error submitting your form. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
