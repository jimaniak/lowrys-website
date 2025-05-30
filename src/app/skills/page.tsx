'use client';

import Layout from '@/components/Layout';
import { FaChartLine, FaLaptopCode, FaTools, FaCheck } from 'react-icons/fa';
import Head from 'next/head';

export default function Skills() {
  return (
    <Layout>
      <Head>
        <title>Business Automation & Financial Analysis Solutions | Jim Lowry, B.S.</title>
        <meta name="description" content="Specialized expertise in financial process automation, data visualization, workflow optimization, and business intelligence solutions that reduce operational costs and improve decision accuracy." />
        <meta name="keywords" content="financial process automation, business data visualization, workflow optimization, business efficiency consultant, robotic process automation, business intelligence solutions" />
        <link rel="canonical" href="https://www.lowrys.org/skills" />
        
        {/* Service Schema Markup */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Business Process Optimization",
              "provider": {
                "@type": "Person",
                "name": "Jim Lowry, B.S.",
                "url": "https://www.lowrys.org/"
              },
              "description": "Comprehensive business process optimization services including workflow automation, financial analysis solutions, and technical implementations",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Business Solution Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Financial Process Automation",
                      "description": "Automated reporting systems that reduce manual work by 70%"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Business Intelligence Dashboards",
                      "description": "Custom data visualization solutions for real-time decision support"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Workflow Optimization",
                      "description": "Business process improvements that reduce operational costs"
                    }
                  }
                ]
              }
            }
          `}
        </script>
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Business Solution Capabilities</h1>
          <p className="text-xl max-w-3xl">
            Explore how my specialized expertise in process automation, financial analysis, and technical implementation can solve your critical business challenges.
          </p>
        </div>
      </section>

      {/* Skills Introduction */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Integrated Business Solutions Approach</h2>
            <p className="text-lg mb-8">
              My business solutions approach combines financial analysis expertise, technical implementation capabilities, and practical problem-solving to address key challenges:
            </p>
            <ul className="text-left mx-auto max-w-xl space-y-2">
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Reducing manual reporting time by 40-60%</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Eliminating data silos and improving information flow</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Optimizing business processes for measurable cost savings</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Improving decision-making through real-time business intelligence</span>
              </li>
            </ul>
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
              <h2 className="text-3xl font-bold mb-4">Financial Process Automation</h2>
              <p className="text-lg mb-6">
                Custom financial reporting systems, data visualization solutions, and business intelligence dashboards that reduce manual work by 50-70% and improve decision accuracy.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Financial Process Automation Solutions</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Automated reporting systems that reduce manual work by 70%</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Custom data integration solutions that eliminate copy-paste operations</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Business intelligence dashboards that provide real-time decision support</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Financial modeling tools that improve forecasting accuracy by 35%</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Process automation that reduces reporting cycle time from days to minutes</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Business Analytics Solutions</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Budget optimization systems that identify cost-saving opportunities</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>ROI analysis frameworks for business investment decisions</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Predictive financial models that improve planning accuracy</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>KPI dashboards that track business performance in real-time</span>
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
              <h2 className="text-3xl font-bold mb-4">Business Process Automation</h2>
              <p className="text-lg mb-6">
                Custom workflow automation, integrated reporting systems, and technical implementations that eliminate manual tasks and reduce operational costs by 25-40%.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Business Intelligence Solutions</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Interactive business intelligence dashboards for executive decision-making</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Automated data refresh systems that eliminate manual updates</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Custom business applications that replace inefficient spreadsheet processes</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Cross-platform data integration solutions</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Workflow Optimization</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>End-to-end process automation that reduces operational costs</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>System integration solutions that eliminate data silos</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Knowledge transfer systems and documentation</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Custom business applications that streamline operations</span>
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
              <h2 className="text-3xl font-bold mb-4">End-to-End Implementation Expertise</h2>
              <p className="text-lg mb-6">
                My practical implementation expertise ensures that solutions move beyond theory to deliver real-world business results. This hands-on approach bridges the gap between business requirements and technical execution.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Technical Implementation</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Solutions that work in practice, not just in concept</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Practical understanding of implementation challenges and how to overcome them</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Ability to bridge the gap between business requirements and technical execution</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>End-to-end project delivery from concept to functioning solution</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Project Execution</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Comprehensive solution design and implementation</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Systematic problem-solving approach for complex challenges</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Attention to detail in technical execution</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Practical solutions that deliver measurable business value</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business Processes?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let&apos;s discuss your specific business challenges and how my proven automation solutions can deliver measurable improvements to your efficiency, costs, and decision-making capabilities.
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
