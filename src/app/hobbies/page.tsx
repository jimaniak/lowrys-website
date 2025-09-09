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
          <h1 className="text-5xl font-bold mb-6 leading-tight">Technical Interests & Learning Journey</h1>
          <p className="text-xl max-w-3xl leading-relaxed">
            The personal exploration and hands-on experimentation that shaped my technical evolution. From AI collaboration discovery to home technology projects and workshop builds, these endeavors showcase the curiosity-driven learning that became the foundation for professional AI Solutions Architecture expertise.
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">The Foundation Behind AI Solutions Architecture</h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto">
            Personal exploration across diverse technical domains—from AI collaboration discovery to enterprise-grade home networking to hands-on workshop projects. These learning endeavors demonstrate the curiosity, experimentation, and continuous improvement mindset that evolved into commercial AI expertise and professional Solutions Architecture capabilities.
          </p>
        </div>
      </section>

      {/* AI Exploration & Learning */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <FaRobot className="text-purple-600 text-3xl mr-4" />
            <h2 className="text-3xl font-bold text-center">AI Collaboration Discovery</h2>
          </div>
          <div className="max-w-4xl mx-auto">
            {/* AI Collaboration Journey */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1" id="ai-journey">
              <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-purple-500">
                  <FaRobot className="text-7xl opacity-40" />
                </div>
                <div className="absolute bottom-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  Foundation Learning → Commercial Mastery
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">The Journey to AI Collaboration Mastery</h3>
                
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="flex items-center text-blue-700 font-semibold mb-2">
                    <FaLightbulb className="mr-2" /> Personal Discovery
                  </h4>
                  <p className="text-gray-700">
                    What started as curiosity about AI tools evolved into a systematic exploration of strategic human-AI collaboration. Through personal experimentation and iterative learning, I discovered that mastering AI collaboration was fundamentally different from mastering traditional technologies—it required developing new partnership methodologies and collaborative frameworks.
                  </p>
                </div>
                
                <div className="mb-6 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <h4 className="flex items-center text-purple-700 font-semibold mb-2">
                    <FaCode className="mr-2" /> Experimental Approach
                  </h4>
                  <p className="text-gray-700">
                    Developed personal frameworks for AI-enhanced development across multiple domains—from web platforms to data processing to automation. Experimented with prompt engineering, workflow orchestration, and multi-agent coordination through hands-on projects that pushed the boundaries of what individual developers could achieve through strategic AI partnership.
                  </p>
                </div>
                
                <div className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="flex items-center text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="mr-2" /> Commercial Evolution
                  </h4>
                  <p className="text-gray-700">
                    Personal exploration matured into commercial expertise, enabling deployment of three enterprise-grade AI platforms. The continuous learning approach that began as hobby investigation became the foundation for professional AI Solutions Architecture capabilities, demonstrating how curiosity-driven experimentation can evolve into market-ready expertise.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-purple-800 mb-3">Current Commercial Platforms Born from Personal Exploration:</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-purple-700">SEO.Lowrys.org</div>
                      <div className="text-purple-600">Multi-Agent AI SEO</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-700">AIrtisan.net</div>
                      <div className="text-purple-600">AI Art Authentication</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-700">Lowrys.org</div>
                      <div className="text-purple-600">Workforce Analytics</div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <Link href="/projects" className="text-purple-600 hover:text-purple-800 underline font-medium">
                      View Commercial AI Platforms →
                    </Link>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Strategic AI Collaboration</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Continuous Learning</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Commercial Innovation</span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">Experimental Methodology</span>
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
                
                <div className="my-6 space-y-6">
                  {/* Beginning */}
                  <div className="text-center">
                    <h5 className="text-lg font-bold text-gray-800 mb-3 tracking-wide">BEGINNING</h5>
                    <Image 
                      src="/images/projects/technical-infrastructure/Beginning.png" 
                      alt="Garage workshop transformation beginning - original state before conversion" 
                      width={600} 
                      height={400} 
                      className="rounded-lg shadow-lg mx-auto hover:shadow-xl transition-shadow"
                      unoptimized={true}
                    />
                  </div>
                  
                  {/* Current Progress */}
                  <div className="text-center">
                    <h5 className="text-lg font-bold text-blue-700 mb-3 tracking-wide">CURRENT PROGRESS</h5>
                    <Image 
                      src="/images/projects/technical-infrastructure/Current.jpg" 
                      alt="Current state of garage workshop conversion showing latest progress and improvements" 
                      width={600} 
                      height={400} 
                      className="rounded-lg shadow-lg mx-auto hover:shadow-xl transition-shadow border-2 border-blue-200"
                      unoptimized={true}
                    />
                  </div>
                  
                  {/* Vision */}
                  <div className="text-center">
                    <h5 className="text-lg font-bold text-green-700 mb-3 tracking-wide">VISION</h5>
                    <Image 
                      src="/images/projects/technical-infrastructure/Vision.png" 
                      alt="Garage workshop transformation vision - planned final state and goals" 
                      width={600} 
                      height={400} 
                      className="rounded-lg shadow-lg mx-auto hover:shadow-xl transition-shadow border-2 border-green-200"
                      unoptimized={true}
                    />
                  </div>
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
