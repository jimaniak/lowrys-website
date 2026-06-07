// src/app/contact/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaExclamationCircle } from 'react-icons/fa';
import ResumeAccessButton from '@/components/ResumeAccessButton';
import ContactFormMessage from '@/components/ContactFormMessage';
import { useFormValidation, FieldValidationRules } from '@/hooks/useFormValidation';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Resource categories
const RESOURCE_CATEGORIES = [
  { value: 'resume', label: 'Resume' },
  { value: 'free_item', label: 'Free Item' },
  { value: 'portfolio', label: 'Portfolio' }
];

export default function Contact() {
  // Define validation rules for form fields
  const validationRules: FieldValidationRules = {
    name: {
      required: true,
      minLength: 2,
      errorMessage: 'Please enter your full name (minimum 2 characters)'
    },
    email: {
      required: true,
      pattern: EMAIL_REGEX,
      errorMessage: 'Please enter a valid email address'
    },
    message: {
      minLength: 10,
      errorMessage: 'Message should be at least 10 characters'
    },
    company: {
      required: true,
      minLength: 2,
      errorMessage: 'Please enter your company or organization name'
    },
    reason: {
      required: true,
      minLength: 20,
      errorMessage: 'Please provide a detailed reason for requesting access (minimum 20 characters)'
    },
    category: {
      required: true,
      errorMessage: 'Please select a resource category'
    }
  };

  // Initial form values
  const initialValues = {
    name: '',
    email: '',
    message: '',
    company: '',
    reason: '',
    requestResume: false,
    category: 'resume', // Default category
    website: '' // Honeypot field - bots will fill this, humans won't see it
  };

  // Use our custom form validation hook
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateForm
  } = useFormValidation(initialValues, validationRules);

  // Additional state for form submission status
  const [status, setStatus] = useState('idle');
  const [apiError, setApiError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [lastSubmissionWasResume, setLastSubmissionWasResume] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null);
  const [turnstileSiteKey] = useState<string | undefined>(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  // Initialize Turnstile widget
  useEffect(() => {
    if (!turnstileSiteKey) return; // Don't initialize if no site key
    
    const initTurnstile = () => {
      if (typeof window !== 'undefined' && (window as any).turnstile) {
        const turnstile = (window as any).turnstile;
        const widgetId = turnstile.render('.cf-turnstile', {
          sitekey: turnstileSiteKey,
          callback: (token: string) => {
            setTurnstileToken(token);
          },
          'expired-callback': () => {
            setTurnstileToken(null);
          },
          'error-callback': () => {
            setTurnstileToken(null);
          },
        });
        setTurnstileWidgetId(widgetId);
      } else {
        // Retry if script hasn't loaded yet
        setTimeout(initTurnstile, 100);
      }
    };

    initTurnstile();
  }, [turnstileSiteKey]);

  // Effect to conditionally validate company and reason fields based on requestResume
  useEffect(() => {
    // No need to validate company, reason, and category if not requesting resume
    if (!values.requestResume) {
      // Clear any existing errors for these fields
      const updatedErrors = { ...errors };
      delete updatedErrors.company;
      delete updatedErrors.reason;
      delete updatedErrors.category;
      
      // Force validation update
      validateForm();
    }
  }, [values.requestResume]);

  // Handle form submission
  const submitForm = async () => {
    // Honeypot check - if this field is filled, it's a bot
    if (values.website) {
      console.log('Bot detected via honeypot');
      setApiError('Invalid submission detected.');
      setStatus('error');
      return;
    }

    // Check for Turnstile token (only if site key is configured)
    if (turnstileSiteKey && !turnstileToken) {
      setApiError('Please complete the security verification.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setApiError('');
    setFormSubmitted(false);

    const isResumeRequest = values.requestResume;
    const requestBody = isResumeRequest
      ? {
          name: values.name,
          email: values.email,
          company: values.company,
          message: values.message,
          reason: values.reason,
          requestResume: true,
          category: values.category,
          turnstileToken: turnstileToken
        }
      : {
          name: values.name,
          email: values.email,
          company: values.company,
          message: values.message,
          requestResume: false,
          turnstileToken: turnstileToken
        };

    try {
      const response = await fetch('/api/request-resume-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch {
        // Ignore JSON parse errors; handled via status code.
      }

      if (!response.ok || !(responseData && responseData.success)) {
        if (responseData && responseData.message) {
          let msg = responseData.message;
          if (responseData.remaining || responseData.expiresAt) {
            msg += `\nExpires: ${responseData.expiresAt ? new Date(responseData.expiresAt).toLocaleString() : ''}`;
            if (responseData.remaining) {
              msg += ` (in ${responseData.remaining})`;
            }
          }
          setApiError(msg);
        } else {
          setApiError('Failed to submit the form. Please try again.');
        }
        setStatus('error');
        return;
      }

      setStatus('success');
      setLastSubmissionWasResume(isResumeRequest);
      setFormSubmitted(true);
      resetForm();
      setTurnstileToken(null);
      // Reset Turnstile widget
      if (turnstileWidgetId && typeof window !== 'undefined' && (window as any).turnstile) {
        (window as any).turnstile.reset(turnstileWidgetId);
      }
    } catch (err) {
      setApiError(`An error occurred. ${err instanceof Error ? err.message : 'Please try again.'}`);
      setStatus('error');
    }
  };

  // Function to determine if a field has an error
  const hasError = (field: string) => touched[field] && errors[field];

  // Function to get input class based on validation state
  const getInputClass = (field: string) => {
    const baseClass = "w-full px-4 py-3 text-base border rounded-md focus:outline-none focus:ring-2";
    
    if (hasError(field)) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }
    
    if (touched[field] && !errors[field]) {
      return `${baseClass} border-green-500 focus:ring-green-500`;
    }
    
    return `${baseClass} border-gray-300 focus:ring-blue-500`;
  };

  // Get category label from value
  const getCategoryLabel = (value: string) => {
    const category = RESOURCE_CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white page-section">
        <div className="page-container">
          <h1 className="page-hero-title mb-6">Contact</h1>
          <p className="page-hero-subtitle max-w-3xl">
            Recruiters and hiring managers — request resume access below. I&apos;ll review your request and email a
            one-time passcode. No public resume link; your email stays private until you submit the form.
          </p>
        </div>
      </section>

      {/* Resume access callout */}
      <section className="py-6 sm:py-8 bg-blue-50 border-b border-blue-100">
        <div className="page-container max-w-3xl text-center">
          <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">How resume access works</h2>
          <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
            1. Submit the form with &quot;Request access to resources&quot; checked ·
            2. I review and approve ·
            3. You receive a 6-character passcode by email ·
            4. Enter it via &quot;Access Resume&quot; anywhere on the site
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="page-section">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="section-title mb-6 sm:mb-8">Connect</h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                Open to AI product engineering, full-stack, and technical lead roles — remote US or hybrid near St. Louis, MO.
                For employment inquiries, check &quot;Request access to resources&quot; on the form.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaEnvelope className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email</h3>
                    <p className="text-gray-600">Please use the contact form — not listed publicly</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaPhone className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Contact Preference</h3>
                    <p className="text-gray-600">Please use the contact form</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaMapMarkerAlt className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Location</h3>
                    <p className="text-gray-600">High Ridge, MO</p>
                  </div>
                </div>
                
                <a
                  href="https://www.linkedin.com/in/jimsitsecurity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition min-h-[44px]"
                >
                  <FaLinkedin className="text-blue-600 text-xl shrink-0" />
                  <span>linkedin.com/in/jimsitsecurity</span>
                </a>

                <a
                  href="https://github.com/jimaniak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition min-h-[44px]"
                >
                  <FaGithub className="text-blue-600 text-xl shrink-0" />
                  <span>github.com/jimaniak</span>
                </a>

                <div className="mt-8 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-base sm:text-lg mb-3">Already have an access code?</h3>
                  <ResumeAccessButton variant="secondary" className="min-h-[44px]" />
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h2 className="section-title mb-2">Send a Message</h2>
              <p className="text-gray-600 mb-8 text-sm">
                Hiring? Check &quot;Request access to resources&quot; and select Resume — include your company and why you need access.
              </p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(submitForm);
              }} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      value={values.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className={getInputClass('name')}
                      required
                    />
                    {hasError('name') && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FaExclamationCircle className="text-red-500" />
                      </div>
                    )}
                  </div>
                  {hasError('name') && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={values.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={getInputClass('email')}
                      required
                    />
                    {hasError('email') && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FaExclamationCircle className="text-red-500" />
                      </div>
                    )}
                  </div>
                  {hasError('email') && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      value={values.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      rows={5}
                      className={getInputClass('message')}
                    />
                    {hasError('message') && (
                      <div className="absolute top-2 right-2 pointer-events-none">
                        <FaExclamationCircle className="text-red-500" />
                      </div>
                    )}
                  </div>
                  {hasError('message') && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requestResume"
                    checked={values.requestResume}
                    onChange={(e) => handleChange('requestResume', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requestResume" className="ml-2 block text-sm text-gray-700">
                    Request access to resources (resume)
                  </label>
                </div>
                
                {/* Show additional fields if requesting resume */}
                {values.requestResume && (
                  <>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Category *
                      </label>
                      <div className="relative">
                        <select
                          id="category"
                          value={values.category}
                          onChange={(e) => handleChange('category', e.target.value)}
                          onBlur={() => handleBlur('category')}
                          className={getInputClass('category')}
                          required
                        >
                          {RESOURCE_CATEGORIES.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        {hasError('category') && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaExclamationCircle className="text-red-500" />
                          </div>
                        )}
                      </div>
                      {hasError('category') && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company/Organization *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="company"
                          value={values.company}
                          onChange={(e) => handleChange('company', e.target.value)}
                          onBlur={() => handleBlur('company')}
                          className={getInputClass('company')}
                          required={values.requestResume}
                        />
                        {hasError('company') && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaExclamationCircle className="text-red-500" />
                          </div>
                        )}
                      </div>
                      {hasError('company') && (
                        <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Why do you need access to the {getCategoryLabel(values.category)}? *
                      </label>
                      <div className="relative">
                        <textarea
                          id="reason"
                          value={values.reason}
                          onChange={(e) => handleChange('reason', e.target.value)}
                          onBlur={() => handleBlur('reason')}
                          rows={3}
                          className={getInputClass('reason')}
                          required={values.requestResume}
                        />
                        {hasError('reason') && (
                          <div className="absolute top-2 right-2 pointer-events-none">
                            <FaExclamationCircle className="text-red-500" />
                          </div>
                        )}
                      </div>
                      {hasError('reason') && (
                        <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                      )}
                    </div>
                  </>
                )}
                
                {/* Honeypot field - hidden from humans, bots will fill it */}
                <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                  <label htmlFor="website">Website (leave blank)</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={values.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Cloudflare Turnstile - only show if configured */}
                {turnstileSiteKey && (
                  <div className="flex justify-center my-4">
                    <div className="cf-turnstile" />
                  </div>
                )}

                {apiError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{apiError}</p>
                  </div>
                )}
                
                {formSubmitted && (
                  <ContactFormMessage isResumeRequest={lastSubmissionWasResume} />
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || status === 'submitting'}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 min-h-[48px] text-base ${
                    (isSubmitting || status === 'submitting') ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {(isSubmitting || status === 'submitting') ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}