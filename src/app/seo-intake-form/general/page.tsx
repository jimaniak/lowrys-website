'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { FormData } from '../types';

export default function GeneralSEOIntakeForm() {
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
      
      return {
        ...prev,
        [name]: isChecked 
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
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
          industry: ''
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              SEO Intake Form
              {preselectedIndustry && (
                <span className="block text-xl text-blue-600 font-normal mt-2">
                  for {preselectedIndustry}
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              Please fill out this form so we can create a customized SEO strategy for your business.
            </p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Thank you! Your SEO intake form has been submitted successfully. We'll be in touch soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              There was an error submitting your form. Please try again or contact us directly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="bestTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Best Time to Call
                  </label>
                  <select
                    id="bestTime"
                    name="bestTime"
                    value={formData.bestTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a time</option>
                    <option value="morning">Morning (8 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry/Business Type *
                  </label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    required
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="e.g., Pest Control, HVAC, Plumbing, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="example.com or www.example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                      Years in Business
                    </label>
                    <select
                      id="yearsInBusiness"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select range</option>
                      <option value="less-than-1">Less than 1 year</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10-20">10-20 years</option>
                      <option value="more-than-20">More than 20 years</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="serviceAreas" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Areas *
                  </label>
                  <textarea
                    id="serviceAreas"
                    name="serviceAreas"
                    required
                    rows={3}
                    value={formData.serviceAreas}
                    onChange={handleInputChange}
                    placeholder="List the cities, counties, or regions where you provide services"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="topServices" className="block text-sm font-medium text-gray-700 mb-1">
                    Main Services/Products *
                  </label>
                  <textarea
                    id="topServices"
                    name="topServices"
                    required
                    rows={3}
                    value={formData.topServices}
                    onChange={handleInputChange}
                    placeholder="List your main services or products"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Current SEO Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current SEO Status</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentSeoProvider" className="block text-sm font-medium text-gray-700 mb-1">
                    Current SEO Provider
                  </label>
                  <input
                    type="text"
                    id="currentSeoProvider"
                    name="currentSeoProvider"
                    value={formData.currentSeoProvider}
                    onChange={handleInputChange}
                    placeholder="Name of current SEO company or 'None'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="monthlySeoInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Monthly SEO Investment
                  </label>
                  <select
                    id="monthlySeoInvestment"
                    name="monthlySeoInvestment"
                    value={formData.monthlySeoInvestment}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select range</option>
                    <option value="0">$0 (No current SEO)</option>
                    <option value="1-500">$1 - $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2500">$1,000 - $2,500</option>
                    <option value="2500-5000">$2,500 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Goals & Target Market */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Goals & Target Market</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="primaryGoal" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary SEO Goal *
                  </label>
                  <select
                    id="primaryGoal"
                    name="primaryGoal"
                    required
                    value={formData.primaryGoal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your main goal</option>
                    <option value="more-leads">Generate more leads</option>
                    <option value="increase-calls">Increase phone calls</option>
                    <option value="improve-rankings">Improve search rankings</option>
                    <option value="brand-awareness">Build brand awareness</option>
                    <option value="compete-better">Compete with competitors</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="targetCustomers" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Customers *
                  </label>
                  <textarea
                    id="targetCustomers"
                    name="targetCustomers"
                    required
                    rows={3}
                    value={formData.targetCustomers}
                    onChange={handleInputChange}
                    placeholder="Describe your ideal customers (homeowners, businesses, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="competitors" className="block text-sm font-medium text-gray-700 mb-1">
                    Main Competitors
                  </label>
                  <textarea
                    id="competitors"
                    name="competitors"
                    rows={3}
                    value={formData.competitors}
                    onChange={handleInputChange}
                    placeholder="List your main competitors (company names)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="differentiators" className="block text-sm font-medium text-gray-700 mb-1">
                    What makes your business unique?
                  </label>
                  <textarea
                    id="differentiators"
                    name="differentiators"
                    rows={3}
                    value={formData.differentiators}
                    onChange={handleInputChange}
                    placeholder="Describe what sets you apart from competitors"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Comments
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    rows={3}
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Any additional information you'd like us to know"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit SEO Intake Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
