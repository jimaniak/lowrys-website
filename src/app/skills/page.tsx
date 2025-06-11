// src/app/skills/page.tsx
'use client';

import { FaChartLine, FaLaptopCode, FaTools, FaCheck } from 'react-icons/fa';
import Head from 'next/head';

export default function Skills() {

  return (
    <>
      <Head>
        <title>Data Analytics, Power BI & Power Platform Skills | Jim Lowry, B.S.</title>
        <meta name="description" content="Jim Lowry's expertise in data analytics, Microsoft Power BI, Power Query/M, Power Platform, and business intelligence. Committed to continuous learning in SQL, Tableau, and Google Data Studio." />
        <meta name="keywords" content="data analytics, Power BI, Power Query, Power Platform, business intelligence, automation, SQL, Tableau, Google Data Studio, continuous learning, Jim Lowry" />
        <link rel="canonical" href="https://www.lowrys.org/skills" />
        {/* Service Schema Markup */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Jim Lowry, B.S.",
              "url": "https://www.lowrys.org/",
              "description": "Data analytics, Power BI, Power Query/M, Power Platform, business intelligence, automation, and continuous learning."
            }
          `}
        </script>
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Data Analytics & Power Platform Skills</h1>
          <p className="text-xl max-w-3xl">
            Specialized in Microsoft Power BI, Power Query (M), and the Power Platform—turning data into actionable insights and automating business processes for measurable results.
          </p>
        </div>
      </section>

      {/* Skills Introduction */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Analytics-Driven Solutions Approach</h2>
            <p className="text-lg mb-8">
              My approach combines deep analytics expertise, technical implementation, and a commitment to continuous learning:
            </p>
            <ul className="text-left mx-auto max-w-xl space-y-2">
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Building interactive dashboards and reports with Power BI & Power Query (M)</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Automating workflows and integrating data using Power Platform tools</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Continuously learning advanced SQL, Tableau, and Google Data Studio</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Delivering practical, real-world business value through analytics</span>
              </li>
            </ul>
            <div className="mt-6 text-blue-700 text-md">
              <strong>Current focus:</strong> Power BI, Power Query/M, and expanding my analytics toolkit with SQL, Tableau, and Google Data Studio.
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Power Platform Skills */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="text-blue-600 text-6xl">
                <FaChartLine />
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-3xl font-bold mb-4">Power BI & Data Analytics</h2>
              <p className="text-lg mb-6">
                Designing and building interactive dashboards, reports, and data models with Power BI and Power Query (M) to deliver actionable business insights.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Power Platform & Automation</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Automating business workflows with Power Automate and Dataverse</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Integrating data from multiple sources for unified analytics</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Developing custom connectors and solutions for unique business needs</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Delivering measurable efficiency gains and business value</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Continuous Learning & Growth</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Currently learning advanced SQL for data engineering and analytics</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Expanding skills in Tableau and Google Data Studio for broader BI capabilities</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Staying current with the latest analytics and BI trends</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Committed to honest self-assessment and continuous improvement</span>
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
              <h2 className="text-3xl font-bold mb-4">Technical Implementation & Digital Skills</h2>
              <p className="text-lg mb-6">
                Applying analytics and automation skills to deliver real-world solutions—bridging the gap between business needs and technical execution.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Business Intelligence & Integration</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Building BI dashboards for executive and operational decision-making</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Automating data refresh and integration across platforms</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Replacing inefficient manual processes with scalable digital solutions</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Documenting and transferring knowledge for sustainable results</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Workflow Optimization & Project Delivery</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>End-to-end project delivery from concept to analytics solution</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Systematic problem-solving for complex business challenges</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Attention to detail in technical execution and documentation</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Delivering measurable business value through analytics and automation</span>
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
              <h2 className="text-3xl font-bold mb-4">Hands-On Analytics & Implementation</h2>
              <p className="text-lg mb-6">
                My hands-on approach ensures analytics and automation solutions deliver real business results—bridging the gap between strategy and execution.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Analytics Implementation</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Solutions that work in practice, not just in concept</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Practical understanding of analytics and automation challenges</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Bridging the gap between business requirements and analytics execution</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>End-to-end delivery from concept to analytics solution</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Project Execution & Value</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Comprehensive analytics solution design and implementation</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Systematic problem-solving for analytics and business challenges</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Attention to detail in analytics execution</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Delivering measurable business value through analytics and automation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Unlock Insights with Analytics?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let’s discuss how data analytics, Power BI, and automation can help you solve business challenges and drive measurable results.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/projects" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
              View Analytics Projects
            </a>
            <a href="/contact" className="bg-transparent hover:bg-blue-700 text-white px-8 py-3 border border-white rounded-lg font-medium transition duration-300">
              Contact Me
            </a>
          </div>
        </div>
      </section>
    </>
  );
}