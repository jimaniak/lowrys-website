// src/app/page.tsx

import Image from "next/image";
import Link from "next/link";
import { FaChartLine, FaLaptopCode, FaTools } from 'react-icons/fa';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Jim Lowry, B.S.</h1>
              <h2 className="text-2xl md:text-3xl text-blue-400 mb-6">Data Analytics & Microsoft Power Platform Solutions</h2>
              <p className="text-lg mb-8">
                Empowering organizations to unlock insights and drive smarter decisions through advanced analytics, automation, and business intelligence—specializing in Microsoft Power BI, Power Query (M), and the Power Platform suite.
              </p>
              <p className="text-md mb-6 text-blue-200">
                <strong>Current Focus:</strong> Data analytics, Power BI, Power Query/M, and continuous upskilling in SQL, Tableau, and Google Data Studio. Always learning, always growing.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300">
                  Get in Touch
                </Link>
                <Link href="/projects" className="bg-transparent hover:bg-white hover:text-gray-900 text-white px-6 py-3 border border-white rounded-lg transition duration-300">
                  View Analytics Projects
                </Link>
                <Link href="/demo" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition duration-300">
                  Try Analytics Demo
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-64 h-64 overflow-hidden rounded-full border-4 border-blue-400">
                <Image 
                  src="/images/jim-lowry-profile.jpg"
                  alt="Jim Lowry, Data Analytics & Power Platform Specialist"
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
          <h2 className="text-3xl font-bold text-center mb-12">Data Analytics & Power Platform Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-semibold mb-3">Power BI & Data Visualization</h3>
              <p className="text-gray-600">
                Building interactive dashboards and reports with Power BI and Power Query (M) to turn raw data into actionable insights for real-world business impact.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaLaptopCode />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automation with Power Platform</h3>
              <p className="text-gray-600">
                Automating workflows and integrating data across systems using Power Automate, Dataverse, and custom connectors—reducing manual work and boosting efficiency.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaTools />
              </div>
              <h3 className="text-xl font-semibold mb-3">Continuous Learning & Growth</h3>
              <p className="text-gray-600">
                Committed to expanding my analytics toolkit—currently learning advanced SQL, Tableau, and Google Data Studio to deliver even more value for clients and teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Unlock the Power of Your Data?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let’s talk about how modern analytics and automation—especially with Microsoft Power Platform—can help you discover new opportunities, solve business challenges, and drive measurable results.
          </p>
          <a href="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
            Contact Me
          </a>
        </div>
      </section>
    </main>
  );
}