'use client';

import { useState } from 'react';
import { FormData, INDUSTRY_CONFIGS } from '../types';

export default function PestControlSEOIntakeForm() {
  const industry = 'pest-control';
  const config = INDUSTRY_CONFIGS[industry];

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
    industry: industry
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const arrayField = name.replace('[]', '') as keyof FormData;
      const currentArray = (formData[arrayField] as string[]) || [];
      
      if (checkbox.checked) {
        setFormData(prev => ({
          ...prev,
          [arrayField]: [...currentArray, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [arrayField]: currentArray.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/seo-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError('There was an error submitting your form. Please try again or contact us directly.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600 mb-6">
              We've received your SEO intake form and will review your information within 24 hours.
            </p>
            <p className="text-gray-600 mb-8">
              Jim Lowry will contact you soon to discuss your customized SEO strategy for your pest control business.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-blue-800">
                <strong>Questions?</strong> Call{' '}
                <a href="tel:636-237-1341" className="text-blue-600 hover:underline">
                  (636) 237-1341
                </a>{' '}
                or email{' '}
                <a href="mailto:Jim@Lowrys.org" className="text-blue-600 hover:underline">
                  Jim@Lowrys.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Pest Control SEO Intake Form</h1>
            <p className="text-blue-100 text-lg">
              Help us create the perfect SEO strategy for your pest control business
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bestTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Best time to contact
                  </label>
                  <select
                    id="bestTime"
                    name="bestTime"
                    value={formData.bestTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a time</option>
                    <option value="morning">Morning (8am-12pm)</option>
                    <option value="afternoon">Afternoon (12pm-5pm)</option>
                    <option value="evening">Evening (5pm-8pm)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Business Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Business Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL *
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    required
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Business
                  </label>
                  <input
                    type="number"
                    id="yearsInBusiness"
                    name="yearsInBusiness"
                    min="0"
                    max="100"
                    value={formData.yearsInBusiness}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Services Offered *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {config.services.map((service) => (
                      <label key={service.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="services[]"
                          value={service.value}
                          checked={formData.services.includes(service.value)}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="serviceAreas" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Areas (List all cities/regions you serve) *
                  </label>
                  <textarea
                    id="serviceAreas"
                    name="serviceAreas"
                    required
                    rows={3}
                    placeholder={config.serviceAreaPlaceholder}
                    value={formData.serviceAreas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="competitors" className="block text-sm font-medium text-gray-700 mb-2">
                    {config.competitorLabel}
                  </label>
                  <textarea
                    id="competitors"
                    name="competitors"
                    rows={3}
                    placeholder="Company names..."
                    value={formData.competitors}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Current Marketing */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Current Marketing & SEO
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="currentSeoProvider" className="block text-sm font-medium text-gray-700 mb-2">
                      Current SEO Provider
                    </label>
                    <input
                      type="text"
                      id="currentSeoProvider"
                      name="currentSeoProvider"
                      value={formData.currentSeoProvider}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="monthlySeoInvestment" className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly SEO Investment
                    </label>
                    <input
                      type="text"
                      id="monthlySeoInvestment"
                      name="monthlySeoInvestment"
                      placeholder="$275"
                      value={formData.monthlySeoInvestment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What SEO work is currently being done?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'monthly-reports', label: 'Monthly reports' },
                      { value: 'keyword-tracking', label: 'Keyword tracking' },
                      { value: 'content-creation', label: 'Content creation' },
                      { value: 'website-updates', label: 'Website updates' },
                      { value: 'directory-submissions', label: 'Local directory submissions' },
                      { value: 'link-building', label: 'Link building' },
                      { value: 'google-ads', label: 'Google Ads management' },
                      { value: 'social-media', label: 'Social media management' }
                    ].map((work) => (
                      <label key={work.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="currentSeoWork[]"
                          value={work.value}
                          checked={formData.currentSeoWork.includes(work.value)}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{work.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Package Selection */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Service Package Interest
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Which service package are you most interested in?
                </label>
                <div className="space-y-4">
                  {[
                    { value: 'immediate-impact', label: 'Immediate Impact Package ($475 one-time)', description: 'Fix content issues and implement quick wins within 30 days' },
                    { value: 'comprehensive-seo', label: 'Comprehensive SEO Program ($395/month)', description: 'Everything you\'re getting now PLUS active monthly optimization work' },
                    { value: 'growth-focused', label: 'Growth-Focused Strategy ($575/month)', description: 'Complete SEO management with content creation and monitoring' },
                    { value: 'discuss-options', label: 'I\'d like to discuss options during our call', description: '' }
                  ].map((pkg) => (
                    <label key={pkg.value} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="package"
                        value={pkg.value}
                        checked={formData.package === pkg.value}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">{pkg.label}</span>
                        {pkg.description && (
                          <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Additional Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="differentiators" className="block text-sm font-medium text-gray-700 mb-2">
                    What makes your pest control company different from competitors?
                  </label>
                  <textarea
                    id="differentiators"
                    name="differentiators"
                    rows={4}
                    placeholder="Years of experience, special certifications, guarantees, eco-friendly methods, etc."
                    value={formData.differentiators}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="commonQuestions" className="block text-sm font-medium text-gray-700 mb-2">
                    Most common customer questions/concerns about pest control
                  </label>
                  <textarea
                    id="commonQuestions"
                    name="commonQuestions"
                    rows={4}
                    placeholder="Safety concerns, treatment effectiveness, pricing questions, etc."
                    value={formData.commonQuestions}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                    Anything else you'd like us to know about your pest control business, goals, or concerns?
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Pest Control SEO Intake Form'}
              </button>
              <p className="mt-4 text-sm text-gray-600">
                Your information is confidential and will only be used to create your SEO strategy.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
