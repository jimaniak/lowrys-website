// src/app/projects/page.tsx

import Link from 'next/link';
import { FaShieldAlt, FaDatabase, FaChartLine } from 'react-icons/fa';
import ProjectCard from '@/components/ProjectCard';
import { portfolioProjects, tierLabels, tierIntros, type ProjectTier } from '@/data/portfolio';

const tierOrder: ProjectTier[] = ['flagship', 'lead', 'solo', 'client', 'enterprise'];

export default function Projects() {
  return (
    <main>
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white page-section">
        <div className="page-container">
          <h1 className="page-hero-title mb-6">Production Portfolio</h1>
          <p className="page-hero-subtitle max-w-3xl">
            Live SaaS products, lead developer engagements, and enterprise foundation work —
            from solo founder velocity to $50M+ critical infrastructure programs at Ameren.
          </p>
        </div>
      </section>

      {tierOrder.map((tier) => {
        const projects = portfolioProjects.filter((p) => p.tier === tier);
        if (projects.length === 0) return null;

        return (
          <section
            key={tier}
            className={`page-section ${tier === 'flagship' ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : tier === 'enterprise' ? 'bg-gray-50' : ''}`}
          >
            <div className="page-container">
              <h2 className="section-title mb-4 text-center">{tierLabels[tier]}</h2>
              {tierIntros[tier] && (
                <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8 text-sm sm:text-base px-2">
                  {tierIntros[tier]}
                  {tier === 'client' && (
                    <>
                      {' '}
                      <a
                        href="https://ezweb.work"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        ezweb.work
                      </a>
                    </>
                  )}
                </p>
              )}
              {!tierIntros[tier] && <div className="mb-8" />}
              <div className={`card-grid ${tier === 'flagship' || tier === 'solo' ? 'lg:grid-cols-2' : ''}`}>
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="page-section">
        <div className="page-container">
          <h2 className="section-title mb-4 text-center">Enterprise Foundation — Ameren</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10 text-sm sm:text-base">
            May 2016 – March 2025 (~9 years, one employer) — Project Manager, Power Platform Architect,
            and Project Controls across $50M+ in IT/cybersecurity programs at 27 power generation facilities.
          </p>
          <div className="card-grid-3">
            <div className="bg-white rounded-lg shadow-lg card-padding">
              <FaShieldAlt className="text-red-500 text-4xl mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-3">OT Cybersecurity Program</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Led enterprise-wide deployment of Tenable OT Security, Verve Security Center, and CyberX
                across nuclear, hydro, solar, and fossil facilities. Custom Splunk playbooks for cross-facility threat detection.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg card-padding">
              <FaDatabase className="text-blue-500 text-4xl mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-3">PMO Dataverse Consolidation</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Consolidated OBIEE/Oracle, Primavera P6, MS Project, and Jira into Dataverse as single authoritative dataset.
                Power Apps, Power Automate ETL, and Power BI dashboards for 8 portfolio managers.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg card-padding sm:col-span-2 lg:col-span-1">
              <FaChartLine className="text-green-500 text-4xl mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-3">Cross-Team Dependencies</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Power BI dashboard aggregating schedule data across 27 shared services — improved resource forecasting
                and reduced conflict-driven delays with custom DAX measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-blue-600 text-white text-center">
        <div className="page-container">
          <h2 className="section-title mb-4">Want the Full Story?</h2>
          <p className="text-base sm:text-xl mb-8 max-w-2xl mx-auto">
            Request resume access for detailed experience, or explore live products directly.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/contact" className="btn-touch-full bg-white text-blue-600 hover:bg-gray-100 font-medium">
              Request Resume
            </Link>
            <Link href="/about" className="btn-touch-full bg-transparent hover:bg-blue-700 text-white border border-white font-medium">
              About Jim
            </Link>
            <Link href="/skills" className="btn-touch-full bg-transparent hover:bg-blue-700 text-white border border-white font-medium">
              Technical Skills
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
