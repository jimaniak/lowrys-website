import Image from "next/image";
import Layout from '@/components/Layout';
import { FaChartLine, FaLaptopCode, FaTools } from 'react-icons/fa';
import Head from 'next/head';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Jim Lowry, B.S. | Business Process Automation & Financial Analysis Solutions</title>
        <meta name="description" content="Expert in business process optimization, financial analysis, and workflow automation solutions. Bridging technical implementation with business objectives for measurable results." />
        <meta name="keywords" content="business process automation, financial analysis solutions, workflow optimization, data-driven decision making, business technology advisor, process efficiency improvement" />
        <link rel="canonical" href="https://www.lowrys.org/" />
        
        {/* LocalBusiness Schema Markup */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Jim Lowry Business Solutions",
              "description": "Business process optimization and financial analysis solutions for improved efficiency and data-driven decision making",
              "url": "https://www.lowrys.org/",
              "image": "https://www.lowrys.org/images/jim-lowry-profile.jpg",
              "telephone": "[Your Business Phone]",
              "email": "[Your Business Email]",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "[Your City]",
                "addressRegion": "[Your State]",
                "postalCode": "[Your Zip]",
                "addressCountry": "US"
              },
              "priceRange": "$$",
              "makesOffer": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Business Process Automation",
                    "description": "Custom workflow automation solutions that reduce manual tasks and operational costs"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Financial Analysis Solutions",
                    "description": "Data visualization and financial reporting systems that improve decision accuracy"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Technical Implementation",
                    "description": "Expert implementation of business technology solutions for measurable results"
                  }
                }
              ]
            }
          `}
        </script>
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Jim Lowry, B.S.</h1>
              <h2 className="text-2xl md:text-3xl text-blue-400 mb-6">Business Process Optimization & Financial Analysis Solutions</h2>
              <p className="text-lg mb-8">
                Helping businesses improve efficiency, reduce costs, and make data-driven decisions through customized automation and analytical solutions.
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
                  alt="Jim Lowry, Business Process Automation Consultant"
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
          <h2 className="text-3xl font-bold text-center mb-12">Business Solution Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-semibold mb-3">Financial Process Automation</h3>
              <p className="text-gray-600">
                Custom financial reporting systems, data visualization solutions, and business intelligence dashboards that reduce manual work by 50-70% and improve decision accuracy.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaLaptopCode />
              </div>
              <h3 className="text-xl font-semibold mb-3">Workflow Automation Solutions</h3>
              <p className="text-gray-600">
                Custom business process automation, integrated reporting systems, and technical implementations that eliminate manual tasks and reduce operational costs.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <FaTools />
              </div>
              <h3 className="text-xl font-semibold mb-3">Practical Implementation</h3>
              <p className="text-gray-600">
                End-to-end solution delivery with hands-on implementation expertise, ensuring business requirements translate into functioning systems that deliver measurable results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Business Processes?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's discuss your specific business challenges and how my proven automation solutions can deliver measurable efficiency gains.
          </p>
          <a href="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition duration-300">
            Contact Me
          </a>
        </div>
      </section>
    </Layout>
  );
}
