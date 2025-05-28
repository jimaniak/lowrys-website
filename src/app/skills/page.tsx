'use client';

import Layout from '@/components/Layout';
import { FaChartLine, FaLaptopCode, FaTools, FaCheck } from 'react-icons/fa';

export default function Skills() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">My Skills</h1>
          <p className="text-xl max-w-3xl">
            Explore my diverse skill set spanning financial analysis, technical implementation, and hands-on expertise.
          </p>
        </div>
      </section>

      {/* Skills Introduction */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Cross-Domain Expertise</h2>
            <p className="text-lg mb-8">
              My unique value proposition comes from the intersection of analytical thinking, technical knowledge, and practical implementation skills. This combination allows me to approach problems holistically and deliver comprehensive solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Financial & Analytical Skills */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="text-blue-600 text-6xl">
                <FaChartLine />
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-3xl font-bold mb-4">Financial & Analytical Skills</h2>
              <p className="text-lg mb-6">
                My strong foundation in financial analysis and data-driven decision making enables me to identify opportunities, optimize performance, and deliver actionable insights.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
			<div className="bg-white p-6 rounded-lg shadow-md">
			  <h3 className="text-xl font-semibold mb-4">Excel Expertise</h3>
			  <ul className="space-y-2">
				<li className="flex items-start">
				  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
				  <span>Advanced formulas and functions (VLOOKUP, INDEX/MATCH, etc.)</span>
				</li>
				<li className="flex items-start">
				  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
				  <span>Power Query for data transformation and ETL processes</span>
				</li>
				<li className="flex items-start">
				  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
				  <span>Data modeling and scenario analysis</span>
				</li>
				<li className="flex items-start">
				  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
				  <span>PivotTables and data visualization</span>
				</li>
				<li className="flex items-start">
				  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
				  <span>Macros and VBA automation</span>
				</li>
			  </ul>
			</div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Financial Analysis</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Budget development and management</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Cost-benefit analysis</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Financial forecasting and modeling</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Performance metrics and KPI tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical & Digital Skills */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="text-blue-600 text-6xl">
                <FaLaptopCode />
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-3xl font-bold mb-4">Technical & Digital Skills</h2>
              <p className="text-lg mb-6">
                My technical expertise allows me to implement solutions that streamline processes, enhance productivity, and leverage technology to solve real-world problems.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Power Platform</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Power BI dashboards and reports</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Power Automate workflow automation</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>PowerApps development</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Power Platform integration with other systems</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Automation & Implementation</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Process automation and optimization</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>System implementation and integration</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Technical documentation and training</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Web development fundamentals</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Hands-on Skills */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="text-blue-600 text-6xl">
                <FaTools />
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-3xl font-bold mb-4">Hands-on Practical Skills</h2>
              <p className="text-lg mb-6">
                My practical skills in electrical work and cabinetry complement my analytical and technical abilities, allowing me to approach problems with a unique perspective and deliver tangible solutions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Electrical Work</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Residential electrical installations</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Troubleshooting and repairs</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Circuit design and implementation</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Safety standards and compliance</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Cabinetry & Woodworking</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Custom cabinet design and construction</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Furniture building and restoration</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Finish carpentry and trim work</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Tool proficiency and workshop safety</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Interested in My Skills?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's discuss how my diverse expertise can benefit your organization or project.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/projects" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
              View My Projects
            </a>
            <a href="/contact" className="bg-transparent hover:bg-blue-700 text-white px-8 py-3 border border-white rounded-lg font-medium transition duration-300">
              Contact Me
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
