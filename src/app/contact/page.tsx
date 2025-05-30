'use client';

import Layout from '@/components/Layout';
import { useState } from 'react';
import { FaEnvelope, FaBriefcase, FaPhoneAlt, FaCalendarCheck } from 'react-icons/fa';
import SocialLinks from '@/components/SocialLinks';
import Head from 'next/head';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('https://formspree.io/f/xovdgkyo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      setError('There was a problem submitting your form. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Contact Jim Lowry, B.S. | Business Process Automation Consultant</title>
        <meta name="description" content="Schedule a consultation to discuss your business process automation, financial analysis, or workflow optimization needs. Let's transform your business challenges into measurable solutions." />
        <meta name="keywords" content="business process consultant, automation solutions, financial analysis consulting, workflow optimization, business technology advisor, contact, consultation" />
        <link rel="canonical" href="https://www.lowrys.org/contact" />
  
        {/* ContactPage Schema */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "ContactPage",
              "name": "Contact Jim Lowry, B.S.",
              "description": "Get in touch to discuss your business process automation, financial analysis, or workflow optimization needs.",
              "mainEntity": {
                "@type": "Person",
                "name": "Jim Lowry, B.S.",
                "description": "Business Process Automation & Financial Analysis Solutions Consultant",
                "email": "contact@lowrys.org",
                "telephone": "",
                "url": "https://www.lowrys.org",
                "sameAs": [
                  "https://www.linkedin.com/in/jimlowry/",
                  "https://github.com/jimlowry"
                ],
                "alumniOf": {
                  "@type": "CollegeOrUniversity",
                  "name": "Webster University",
                  "department": "George Herbert Walker School of Business & Technology"
                },
                "knowsAbout": [
                  "Business Process Automation",
                  "Financial Analysis Solutions",
                  "Workflow Optimization",
                  "Data-Driven Decision Making",
                  "Technical Implementation"
                ]
              }
            }
          `}
        </script>
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Schedule a Business Solutions Consultation</h1>
          <p className="text-xl max-w-3xl">
            Ready to transform your business processes? Let's discuss how my expertise in process automation, financial analysis, and technical implementation can deliver measurable results for your organization.
          </p>
        </div>
      </section>
      
      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-8">Business Solutions Inquiries</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <FaEnvelope size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Email</h3>
                    <p className="text-gray-600 mb-1">Business Process Consulting:</p>
                    <a href="mailto:contact@lowrys.org" className="text-blue-600 hover:underline">contact@lowrys.org</a>
                    
                    <p className="text-gray-600 mt-4 mb-1">Solution Implementation:</p>
                    <a href="mailto:business@lowrys.org" className="text-blue-600 hover:underline">business@lowrys.org</a>
                    
                    <p className="text-gray-600 mt-4 mb-1">Project Proposals:</p>
                    <a href="mailto:projects@lowrys.org" className="text-blue-600 hover:underline">projects@lowrys.org</a>
                    
                    <p className="text-gray-600 mt-4 mb-1">Feedback & Recommendations:</p>
                    <a href="mailto:suggestions@lowrys.org" className="text-blue-600 hover:underline">suggestions@lowrys.org</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <FaCalendarCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Consultation Scheduling</h3>
                    <p className="text-gray-600">
                      For a detailed discussion of your business process needs, please use the form to schedule a consultation. Initial consultations are complimentary and focused on understanding your specific challenges.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <FaBriefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Professional Network</h3>
                    <p className="text-gray-600 mb-2">Connect with me on professional platforms:</p>
                    <div className="flex space-x-4 mt-2">
                      <SocialLinks className="justify-start" iconSize={21} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Request a Business Solutions Consultation</h2>
                
                {isSubmitted ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <p>Thank you for your inquiry! I'll review your business needs and contact you within 1-2 business days to schedule a consultation.</p>
                  </div>
                ) : null}
                
                {error ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                  </div>
                ) : null}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Business Challenge</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g., Process Automation, Financial Analysis, Workflow Optimization"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Project Details</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please describe your business challenge and desired outcomes..."
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Request Consultation'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Availability Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Current Availability</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            I'm currently accepting new clients for business process automation consulting, financial analysis solutions, and technical implementation projects. My approach focuses on delivering measurable business outcomes through practical, implementable solutions.
          </p>
          <div className="inline-block bg-white px-8 py-4 rounded-lg shadow-md">
            <p className="text-xl font-semibold text-blue-600">
              Let's transform your business challenges into measurable results!
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
