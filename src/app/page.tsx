import Image from "next/image";
import Layout from '@/components/Layout';
import { FaChartLine, FaLaptopCode, FaTools } from 'react-icons/fa';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Jim Lowry</h1>
              <h2 className="text-2xl md:text-3xl text-blue-400 mb-6">Versatile Professional with Cross-Domain Expertise</h2>
              <p className="text-lg mb-8">
                Combining financial analysis, technical implementation, and hands-on skills 
                to deliver comprehensive solutions across multiple domains.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300">
                  Get in Touch
                </a>
                <a href="/projects" className="bg-transparent hover:bg-white hover:text-gray-900 text-white px-6 py-3 border border-white rounded-lg transition duration-300">
                  View My Work
                </a>
              </div>
            </div>
			<div className="md:w-1/2 flex justify-center">
			  <div className="w-64 h-64 overflow-hidden rounded-full border-4 border-blue-400">
				<Image 
				  src="/images/jim-lowry-profile.jpg"
				  alt="Jim Lowry"
				  width={256}
				  height={256}
				  className="object-cover w-full h-full object-[center_top]"
				/>
			  </div>
			</div>

          </div>
        </div>
      </section>

      {/* Core Competencies Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Core Competencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-semibold mb-3">Financial & Analytical</h3>
              <p className="text-gray-600">
                Excel expertise, financial analysis, and data-driven decision making to optimize 
                business performance and identify growth opportunities.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaLaptopCode />
              </div>
              <h3 className="text-xl font-semibold mb-3">Technical & Digital</h3>
              <p className="text-gray-600">
                Power Platform implementation, automation solutions, and technical expertise 
                to streamline processes and enhance productivity.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaTools />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hands-on Skills</h3>
              <p className="text-gray-600">
                Electrical work, cabinetry, and practical problem-solving abilities to deliver 
                tangible results and creative solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Work Together?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            I'm available for consulting, project work, and full-time opportunities.
          </p>
          <a href="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
            Contact Me
          </a>
        </div>
      </section>
    </Layout>
  );
}
