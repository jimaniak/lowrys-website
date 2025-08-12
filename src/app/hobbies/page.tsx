// src/app/hobbies/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { FaCode, FaTools, FaRobot, FaNetworkWired, FaHome, FaWrench, FaExternalLinkAlt, FaLightbulb, FaCheckCircle } from 'react-icons/fa';

export default function Hobbies() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Hobbies & Technical Interests</h1>
          <p className="text-xl max-w-3xl leading-relaxed">
            Exploring technology, solving practical challenges, and building things in my personal time. These projects reflect my curiosity, creativity, and hands-on approach to learning new technologies and implementing solutions.
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Personal Project Categories</h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto">
            From web development experiments to home automation and workshop projects, these endeavors showcase my technical interests and problem-solving approach outside of professional work.
          </p>
        </div>
      </section>

      {/* Web Development & AI Projects */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <FaCode className="text-green-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">Web Development & AI Exploration</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* AIrtisan.net Web Platform Project */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="airtisan-platform">
              <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-green-500">
                  <FaCode className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">AI-Enhanced Web Platform Learning</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Personal goal to build a modern, responsive web platform showcasing analytics and continuous learning while experimenting with AI-assisted development techniques.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Created AIrtisan.net using Next.js and React, leveraging AI collaboration for enhanced development efficiency. Implemented advanced SEO, analytics-focused content, and responsive design.
                  </p>
                </div>
                
                <div className="my-4">
                  <Link 
                    href="https://airtisan.net" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mx-auto w-fit"
                  >
                    <Image 
                      src="/images/projects/web-development/airtisan-platform.png" 
                      alt="AIrtisan.net web platform showcasing AI-enhanced development techniques" 
                      width={600} 
                      height={400} 
                      className="rounded-lg shadow-md mx-auto hover:opacity-90 transition-opacity cursor-pointer"
                      unoptimized={true}
                    />
                  </Link>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Outcome
                  </h4>
                  <p className="text-gray-700">
                    Delivered a high-performance web platform with optimized SEO and seamless user experience. The AI-assisted process accelerated learning and supported exploration of modern development techniques.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Next.js</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">React</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">AI Development</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">SEO Optimization</span>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <a 
                    href="https://airtisan.net" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    View Project <span className="ml-2">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* AI-Enhanced Solutions */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="ai-solutions">
              <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-purple-500">
                  <FaRobot className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">AI-Powered Technical Solution Development</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Personal exploration of how AI tools can augment technical capabilities across diverse technologies for faster solution development.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Experimented with AI tools to augment technical capabilities across multiple domains, creating a personal framework for rapid solution development and learning.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Outcome
                  </h4>
                  <p className="text-gray-700">
                    Accelerated personal learning and implementation, delivered sophisticated solutions with fewer resources, and expanded capabilities beyond traditional boundaries.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">AI Integration</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Technical Learning</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Innovation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Home Technology Projects */}
      <section className="py-16 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <FaNetworkWired className="text-cyan-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">Home Technology Projects</h2>
          </div>
          
          <p className="text-lg text-center mb-12 max-w-3xl mx-auto">
            Personal exploration of enterprise-level technologies in home environments. These projects let me experiment with advanced networking, security, and automation concepts.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Enterprise-Grade Home Network */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="home-network">
              <div className="h-64 bg-gradient-to-br from-cyan-50 to-cyan-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-cyan-500">
                  <FaNetworkWired className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Enterprise-Grade Home Network</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Personal interest in implementing enterprise-level network security, reliability, and performance concepts in a home environment.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Designed and implemented semi-commercial network infrastructure using professional-grade Ubiquiti equipment including UDM-Pro, managed switches, and dedicated WiFi access points.
                  </p>
                </div>
                
                <div className="my-4">
                  <Image 
                    src="/images/projects/technical-infrastructure/NetworkTraffic.gif"
                    alt="Live network traffic visualization showing data flow through enterprise-grade home network" 
                    width={600} 
                    height={400} 
                    className="rounded-lg shadow-md mx-auto"
                    unoptimized={true}
                  />
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Outcome
                  </h4>
                  <p className="text-gray-700">
                    Created a robust foundation with 1Gbps fiber primary connection and 400Mbps LTE failover, enabling reliable connectivity and hands-on learning with enterprise networking concepts.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Network Architecture</span>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Security Implementation</span>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Redundancy Planning</span>
                </div>
              </div>
            </div>
            
            {/* Integrated Smart Home Automation */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="h-64 bg-gradient-to-br from-cyan-50 to-cyan-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-cyan-500">
                  <FaHome className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Integrated Smart Home Automation</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Personal interest in creating intelligent home environment with complex integration between disparate systems and contextual automation logic.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Implemented comprehensive Home Assistant automation system integrating security cameras, environmental controls, and monitoring with centralized management and advanced conditional logic.
                  </p>
                </div>
                
                <div className="my-4">
                  <Image 
                    src="/images/projects/technical-infrastructure/HomeAutomation.png"
                    alt="Integrated home automation system architecture showing component relationships" 
                    width={600} 
                    height={400} 
                    className="rounded-lg shadow-md mx-auto"
                    unoptimized={true}
                  />
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Outcome
                  </h4>
                  <p className="text-gray-700">
                    Achieved 30% energy savings, enhanced security with multi-layered protection, and gained hands-on experience with systems integration and automation logic.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Systems Integration</span>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Automation Logic</span>
                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Energy Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hands-On Workshop Projects */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <FaTools className="text-amber-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">Hands-On Workshop Projects</h2>
          </div>
          
          <p className="text-lg text-center mb-12 max-w-3xl mx-auto">
            Physical projects that showcase practical problem-solving and implementation skills. These hands-on challenges demonstrate how I approach complex renovation and building tasks.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Laundry Room Rebuild */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="laundry-room">
              <div className="h-64 bg-gradient-to-br from-amber-50 to-amber-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                  <FaWrench className="text-7xl opacity-40" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Laundry Room Rebuild</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Personal project to transform outdated laundry room with inefficient layout, inadequate storage, and outdated electrical systems.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Designed and implemented complete renovation including custom cabinetry, updated electrical work with dedicated circuits, improved plumbing, and integrated smart home features.
                  </p>
                </div>
                
                <div className="my-4">
                  <Image 
                    src="/images/projects/technical-infrastructure/LaundryRoomTransformation.gif"
                    alt="Before and after transformation of laundry room showing complete renovation" 
                    width={600} 
                    height={400} 
                    className="rounded-lg shadow-md mx-auto"
                    unoptimized={true}
                  />
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Outcome
                  </h4>
                  <p className="text-gray-700">
                    Created a highly functional space with improved workflow, ample storage, and integrated technology that enhances safety through leak detection and power monitoring.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Custom Cabinetry</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Electrical Work</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Smart Integration</span>
                </div>
              </div>
            </div>
            
            {/* Garage Workshop Conversion */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="garage-workshop">
              <div className="h-64 bg-gradient-to-br from-amber-50 to-amber-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                  <FaTools className="text-7xl opacity-40" />
                </div>
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  In Progress
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">Garage Workshop Conversion</h3>
                
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="flex items-center text-red-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Challenge
                  </h4>
                  <p className="text-gray-700">
                    Personal goal to transform standard garage into efficient multi-purpose workshop while maintaining parking functionality.
                  </p>
                </div>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Solution
                  </h4>
                  <p className="text-gray-700">
                    Currently transforming garage with enhanced electrical systems, custom storage solutions, and optimized workflow layout while maintaining dual functionality.
                  </p>
                </div>
                
                <div className="my-4">
                  <Image 
                    src="/images/projects/technical-infrastructure/GarageTransformationJourney.png" 
                    alt="Garage workshop transformation journey showing progress and vision" 
                    width={600} 
                    height={1200} 
                    className="rounded-lg shadow-md mx-auto"
                    unoptimized={true}
                  />
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Goal
                  </h4>
                  <p className="text-gray-700">
                    Creating a versatile space that demonstrates space optimization, systems planning, and the ability to execute multiple functional requirements within constraints.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Workshop Design</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Custom Storage</span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">Workflow Optimization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Curious About My Professional Work?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            These personal projects showcase my technical interests and problem-solving approach. For business-focused project management and analytics experience, check out my professional projects.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/projects" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
              View Professional Projects
            </a>
            <a href="/contact" className="bg-transparent hover:bg-white hover:text-blue-600 text-white px-8 py-3 border border-white rounded-lg font-medium transition duration-300">
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
