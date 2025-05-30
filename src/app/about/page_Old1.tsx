'use client';

import Layout from '@/components/Layout';
import Image from 'next/image';
import { FaLinkedin, FaFileAlt } from 'react-icons/fa';
import Head from 'next/head';
//import SocialLinks from '@/components/SocialLinks';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>Experienced Business Process Consultant | Jim Lowry, B.S.</title>
        <meta name="description" content="Versatile consultant with cross-domain expertise in financial analysis, process automation, and technical implementation. Solving complex business challenges with practical solutions." />
        <meta name="keywords" content="business process consultant, cross-domain expertise, technical implementation specialist, business solutions expert, process optimization consultant, business efficiency improvements" />
        <link rel="canonical" href="https://www.lowrys.org/about" />
        
        {/* Person Schema Markup */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Jim Lowry",
              "givenName": "Jim",
              "familyName": "Lowry",
              "honorificSuffix": "B.S.",
              "description": "Business process optimization and financial analysis solutions consultant specializing in workflow automation and data-driven decision making",
              "jobTitle": "Business Solutions Consultant",
              "knowsAbout": [
                "Business Process Automation",
                "Financial Analysis",
                "Data Visualization",
                "Power Platform Implementation",
                "Workflow Optimization"
              ],
              "alumniOf": {
                "@type": "CollegeOrUniversity",
                "name": "Webster University",
                "department": "George Herbert Walker School of Business & Technology"
              },
              "hasCredential": {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "degree",
                "name": "Bachelor of Science in Information Management",
                "educationalLevel": "Undergraduate"
              },
              "url": "https://www.lowrys.org/",
              "image": "https://www.lowrys.org/images/jim-lowry-profile.jpg",
              "sameAs": [
                "https://www.linkedin.com/in/jimsitsecurity"
              ]
            }
          `}
        </script>
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">About Jim Lowry, B.S.</h1>
          <p className="text-xl max-w-3xl">
            Learn how my business process optimization approach has helped organizations reduce operational costs, improve efficiency, and make better data-driven decisions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left Column - Bio */}
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-6">My Business Solutions Approach</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  I&apos;m Jim Lowry, B.S., a business solutions consultant specializing in process automation, financial analysis systems, and technical implementations that solve critical business challenges. Throughout my career, I&apos;ve helped organizations transform manual processes into efficient automated workflows that deliver measurable ROI.
                </p>
                <p className="text-lg">
                  With extensive experience in data analysis and digital solutions, I&apos;ve helped organizations optimize 
                  their business performance and identify growth opportunities. My analytical mindset allows me to transform 
                  complex data into actionable insights, regardless of the platform or technology involved.
                </p>
                <p className="text-lg">
                  In the technical realm, I apply the same logical principles across various platforms and languages, 
                  from spreadsheet applications to database systems, automation tools, and programming environments. 
                  I understand that while syntax may differ, the underlying logic remains consistent, allowing me to 
                  adapt quickly to new technologies and deliver effective solutions.
                </p>
                <p className="text-lg">
                  What sets me apart is my comprehensive approach to problem-solving. I combine analytical thinking with 
                  practical implementation, drawing on my diverse background to develop solutions that address both 
                  technical requirements and business needs. This cross-domain perspective enables me to see connections 
                  and opportunities that might be missed by those with more narrowly focused backgrounds.
                </p>
                <p className="text-lg">
                  I&apos;m passionate about continuous learning and applying my diverse skill set to deliver comprehensive 
                  solutions across multiple domains. My professional goal is to leverage my cross-domain expertise to create 
                  meaningful impact through innovative and efficient technical solutions.
                </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Education & Credentials</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  Bachelor of Science in Information Management, George Herbert Walker School of Business & Technology, Webster University
                </p>
                <p className="text-lg">
                  My academic background provides a strong theoretical foundation that complements my practical experience in delivering business solutions that drive measurable results.
                </p>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">My Business Optimization Methodology</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  My consulting approach follows a proven methodology:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li className="text-lg"><strong>Business Process Analysis:</strong> Identifying inefficiencies and bottlenecks in current workflows</li>
                  <li className="text-lg"><strong>Solution Design:</strong> Creating custom automation and analytical solutions tailored to your specific business needs</li>
                  <li className="text-lg"><strong>Implementation:</strong> Deploying solutions with minimal disruption to ongoing operations</li>
                  <li className="text-lg"><strong>Measurement:</strong> Tracking key performance indicators to quantify efficiency gains and ROI</li>
                  <li className="text-lg"><strong>Continuous Improvement:</strong> Refining solutions based on real-world performance data</li>
                </ol>
                <p className="text-lg">
                  This systematic approach ensures that every solution delivers tangible business value and measurable results.
                </p>
                <p className="text-lg">
                  My diverse background allows me to communicate effectively with stakeholders at all levels, translating 
                  complex technical concepts into business terms and vice versa. This ability to bridge different domains 
                  makes me a valuable asset in cross-functional teams, where I can adapt to various technical environments 
                  while maintaining focus on business objectives.
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
                    alt="Jim Lowry, Business Process Automation Consultant"
                    width={192}
                    height={192}
                    className="object-cover w-full h-full object-[center_top]"
                  />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-center">Jim Lowry, B.S.</h3>
                <p className="text-center mb-6">Business Solutions Consultant</p>
              
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
                  <a 
                    href="/documents/jim-lowry-resume.pdf" 
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFileAlt size={24} />
                    <span>Download Resume</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
