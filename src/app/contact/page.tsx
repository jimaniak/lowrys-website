// src/app/contact/page.tsx
'use client';

import Layout from '@/components/Layout';
import { useState } from 'react';
import Head from 'next/head';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [requestResume, setRequestResume] = useState(false);
  const [company, setCompany] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    
    // Validate form
    if (requestResume && (!name || !email || !company || !reason)) {
      setError('Please complete all required fields for resume access');
      setStatus('error');
      return;
    }
    
    try {
      // Submit to Formspree
      const formspreeResponse = await fetch('https://formspree.io/f/xwkdkwgj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          message,
          requestResume,
          company: requestResume ? company : 'N/A',
          reason: requestResume ? reason : 'N/A'
        } )
      });
      
      if (!formspreeResponse.ok) {
        throw new Error('Failed to submit form');
      }
      
      // If resume was requested, send approval request
		// In your handleSubmit function, modify the resume request section:
		if (requestResume) {
		  try {
			const resumeResponse = await fetch('/api/request-resume-access', {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify({
				name,
				email,
				company,
				reason
			  })
			});
			
			if (!resumeResponse.ok) {
			  // Get the error details from the response
			  const errorData = await resumeResponse.json();
			  throw new Error(errorData.error || 'Failed to process resume request');
			}
			
			setStatus('success-resume');
		  } catch (err) {
			console.error('Error processing resume request:', err);
			setError(`Resume request error: ${err.message}`);
			setStatus('error');
			return; // Stop execution if resume request fails
		  }
		} else {
		  setStatus('success');
		}

      
      // Clear form
      setName('');
      setEmail('');
      setMessage('');
      setRequestResume(false);
      setCompany('');
      setReason('');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('An error occurred. Please try again.');
      setStatus('error');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Contact Me</h1>
          <p className="text-xl max-w-3xl leading-relaxed">
            Have a business challenge that needs solving? I&apos;d love to discuss how my cross-domain expertise can help transform your processes and implement effective solutions.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
              <p className="text-lg text-gray-600 mb-8">
                I&apos;m available for consulting engagements, project work, and discussions about business process optimization and technical implementation challenges.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaEnvelope className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email</h3>
                    <p className="text-gray-600">business@lowrys.org</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaPhone className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Phone</h3>
                    <p className="text-gray-600">See Resume</p>
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
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaLinkedin className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">LinkedIn</h3>
                    <a href="https://www.linkedin.com/in/jimsitsecurity" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">linkedin.com/in/MyLinkedIn
					</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaGithub className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">GitHub</h3>
                    <a href="https://github.com/jimaniak" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">github.com/MyGitHub</a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e ) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requestResume"
                    checked={requestResume}
                    onChange={(e) => setRequestResume(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requestResume" className="ml-2 block text-sm text-gray-700">
                    Request access to resume
                  </label>
                </div>
                
                {requestResume && (
                  <>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company/Organization *
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for requesting resume *
                      </label>
                      <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </>
                )}
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                
                {status === 'success' && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <p className="text-green-700">Your message has been sent successfully!</p>
                  </div>
                )}
                
                {status === 'success-resume' && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <p className="text-green-700">
                      Your message and resume request have been submitted. You&apos;ll receive access once approved.
                    </p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ${
                    status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
