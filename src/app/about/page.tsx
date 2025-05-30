'use client';

import Layout from '@/components/Layout';
import Image from 'next/image';
//import SocialLinks from '@/components/SocialLinks';
import { FaLinkedin, FaFileAlt } from 'react-icons/fa';

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">About Me</h1>
          <p className="text-xl max-w-3xl">
            Learn more about my professional journey, background, and approach to solving complex problems across multiple domains.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left Column - Bio */}
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-6">My Professional Journey</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  I&apos;m Jim Lowry, a versatile professional with a unique combination of skills spanning financial analysis, 
                  technical implementation, and practical problem-solving. Throughout my career, I&apos;ve focused on bridging 
                  the gap between business objectives and technical solutions.
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

              <h2 className="text-3xl font-bold mt-12 mb-6">My Approach</h2>
              <div className="space-y-6">
                <p className="text-lg">
                  I believe in taking a holistic approach to problem-solving, considering both the analytical and practical 
                  aspects of any challenge. By understanding the fundamental principles that underlie different technologies, 
                  I can select the most appropriate tools for each situation and deliver solutions that are both strategically 
                  sound and practically feasible.
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
					alt="Jim Lowry"
					width={192}
					height={192}
					className="object-cover w-full h-full object-[center_top]"
				  />
				</div>
                
                <h3 className="text-xl font-bold mb-4 text-center">Jim Lowry</h3>
                <p className="text-center mb-6">Versatile Professional with Cross-Domain Expertise</p>
              
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
