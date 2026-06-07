import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import type { PortfolioProject } from '@/data/portfolio';
import type { ProjectDetail } from '@/data/project-details';

interface ProjectDetailViewProps {
  project: PortfolioProject;
  detail: ProjectDetail;
}

export default function ProjectDetailView({ project, detail }: ProjectDetailViewProps) {
  const imageFit = project.imageFit ?? 'cover';
  const letterbox = imageFit === 'contain';

  return (
    <main>
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white page-section">
        <div className="page-container">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 min-h-[44px] text-sm font-medium"
          >
            <FaArrowLeft className="text-xs" />
            All projects
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-violet-300 text-sm font-medium mb-2 uppercase tracking-wide">Case study</p>
              <h1 className="page-hero-title mb-4">{project.name}</h1>
              <p className="page-hero-subtitle">{detail.tagline}</p>
              <p className="text-gray-400 mt-3 text-sm sm:text-base">
                {project.role} · {project.period}
              </p>
            </div>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg min-h-[44px] shrink-0"
              >
                <FaExternalLinkAlt className="text-sm" />
                Visit live product
              </a>
            )}
          </div>
        </div>
      </section>

      {project.image && (
        <section className="border-b border-gray-200">
          <div
            className={`h-48 sm:h-72 md:h-80 relative overflow-hidden ${
              letterbox
                ? 'bg-gradient-to-r from-black via-gray-900 to-black'
                : 'bg-gradient-to-br from-gray-50 to-gray-100'
            }`}
          >
            <Image
              src={project.image}
              alt={`${project.name} screenshot`}
              width={1200}
              height={675}
              className={`absolute inset-0 w-full h-full object-center ${
                letterbox ? 'object-contain' : 'object-cover'
              }`}
              unoptimized
              priority
            />
          </div>
        </section>
      )}

      <section className="page-section bg-white">
        <div className="page-container max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">{detail.overview}</p>
          {detail.velocity && (
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-5 mb-8">
              <h3 className="font-semibold text-violet-900 mb-2">Delivery velocity</h3>
              <p className="text-violet-950 text-sm sm:text-base leading-relaxed">{detail.velocity}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-10">
            {project.stack.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">Architecture</h2>
          <div className="grid gap-6 sm:grid-cols-2 mb-10">
            {detail.architecture.map((section) => (
              <div key={section.title} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="text-gray-600 text-sm flex gap-2">
                      <span className="text-blue-500 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">What shipped</h2>
          <ul className="space-y-3 mb-10">
            {detail.shipped.map((item) => (
              <li key={item} className="text-gray-700 flex gap-3">
                <span className="text-green-600 font-bold shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {detail.distinctFrom && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Related products</h3>
              <p className="text-gray-600 text-sm sm:text-base">{detail.distinctFrom}</p>
            </div>
          )}

          {detail.repoNote && (
            <p className="text-gray-500 text-sm">{detail.repoNote}</p>
          )}
        </div>
      </section>
    </main>
  );
}
