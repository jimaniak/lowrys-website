// src/app/about/page.tsx
'use client';

import Image from 'next/image';
import { FaLinkedin } from 'react-icons/fa';
import ResumeAccessButton from '@/components/ResumeAccessButton';

// Note: Metadata should be in a separate layout.tsx file or using generateMetadata
export default function About() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">About Jim Lowry, B.S.</h1>
          <p className="text-xl max-w-3xl">
            Data Analytics & Power Platform Specialist | Turning Data Into Actionable Insights
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left Column - Bio */}
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-6">My Analytics & Business Solutions Approach</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  I&apos;m Jim Lowry, B.S., a data analytics and business solutions consultant specializing in Microsoft Power Platform, Power BI, and Power Query (M). My passion is helping organizations transform raw data into actionable insights and automate processes for measurable business impact.
                </p>
                <p className="text-lg">
                  I focus on building interactive dashboards, automating workflows, and integrating data across systems—empowering teams to make smarter, faster decisions. My core strengths are in Power BI, Power Query/M, and the broader Power Platform suite, with a growing skillset in SQL, Tableau, and Google Data Studio.
                </p>
                <p className="text-lg">
                  I believe in honest self-assessment and continuous learning. While I have deep expertise in Power Platform and data analytics, I am actively expanding my toolkit to include more advanced data engineering and visualization tools. My learning journey is ongoing, and I’m committed to staying at the forefront of analytics best practices.
                </p>
                <p className="text-lg">
                  My approach combines analytical thinking, technical implementation, and a drive for practical results. I thrive on solving complex business challenges and delivering solutions that bridge the gap between data, technology, and real-world business needs.
                </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Education & Credentials</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  Bachelor of Science in Information Management, George Herbert Walker School of Business & Technology, Webster University
                </p>
                <p className="text-lg">
                  My academic background provides a strong foundation in information systems, analytics, and business process optimization.
                </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Analytics Methodology & Learning Journey</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  My analytics and business optimization methodology is rooted in:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li className="text-lg"><strong>Data Discovery:</strong> Identifying key data sources and business questions</li>
                  <li className="text-lg"><strong>Solution Design:</strong> Building custom analytics and automation solutions using Power BI, Power Query/M, and Power Platform</li>
                  <li className="text-lg"><strong>Implementation:</strong> Delivering solutions that integrate seamlessly with business operations</li>
                  <li className="text-lg"><strong>Measurement:</strong> Tracking KPIs and business outcomes to ensure real value</li>
                  <li className="text-lg"><strong>Continuous Improvement:</strong> Iterating and learning from every project, always seeking new skills and better results</li>
                </ol>
                <p className="text-lg">
                  <strong>Current learning goals:</strong> Deepening my expertise in SQL, Tableau, and Google Data Studio to complement my Power Platform skills and deliver even more impactful analytics solutions.
                </p>
                <p className="text-lg">
                  I communicate effectively with both technical and business stakeholders, translating complex analytics into clear, actionable insights. My cross-domain perspective helps me see connections and opportunities that drive innovation.
                </p>
              </div>
            </div>

            {/* Right Column - Profile and Links */}
            <div className="md:w-1/3">
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                {/* Profile Image */}
                <div className="w-48 h-48 mx-auto mb-6 overflow-hidden rounded-full">
                  <Image 
                    src="/images/jim-lowry-profile.jpg"
                    alt="Jim Lowry, Data Analytics & Power Platform Specialist"
                    width={192}
                    height={192}
                    className="object-cover w-full h-full object-[center_top]"
                  />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">Jim Lowry, B.S.</h3>
                <p className="text-center mb-6">Data Analytics & Power Platform Specialist</p>
                <div className="space-y-4">
                  <a 
                    href="https://www.linkedin.com/in/jimsitsecurity" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition"
                  >
                    <FaLinkedin size={24} />
                    <span>LinkedIn Profile</span>
                  </a>
                  <ResumeAccessButton variant="primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}