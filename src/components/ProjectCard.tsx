import Image from 'next/image';
import Link from 'next/link';
import { FaExternalLinkAlt, FaArrowRight } from 'react-icons/fa';
import type { PortfolioProject } from '@/data/portfolio';
import { hasProjectDetail } from '@/data/project-details';

interface ProjectCardProps {
  project: PortfolioProject;
  showImage?: boolean;
}

const statusColors: Record<PortfolioProject['status'], string> = {
  Live: 'bg-green-100 text-green-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Client Delivery': 'bg-blue-100 text-blue-800',
  Enterprise: 'bg-gray-100 text-gray-800',
};

const defaultAccent = 'from-blue-600 to-indigo-700';

export default function ProjectCard({ project, showImage = true }: ProjectCardProps) {
  const accent = project.accent ?? defaultAccent;
  const imageFit = project.imageFit ?? 'cover';
  const letterbox = imageFit === 'contain';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition duration-300 md:hover:shadow-xl md:hover:-translate-y-1 flex flex-col h-full">
      {showImage && project.image && (
        <div
          className={`h-44 sm:h-56 relative overflow-hidden ${
            letterbox
              ? 'bg-gradient-to-r from-black via-gray-900 to-black'
              : 'bg-gradient-to-br from-gray-50 to-gray-100'
          }`}
        >
          <Image
            src={project.image}
            alt={`${project.name} platform`}
            width={600}
            height={224}
            className={`absolute inset-0 w-full h-full object-center ${
              letterbox ? 'object-contain' : 'object-cover opacity-90'
            }`}
            unoptimized
          />
        </div>
      )}
      {showImage && !project.image && (
        <div
          className={`h-28 sm:h-36 bg-gradient-to-br ${accent} relative flex items-end p-4 sm:p-5`}
          aria-hidden
        >
          <span className="text-white font-bold text-lg sm:text-xl drop-shadow-sm">{project.name}</span>
        </div>
      )}
      <div className="card-padding flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-2 mb-3">
          <h3 className="text-xl sm:text-2xl font-bold">{project.name}</h3>
          <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {project.role} · {project.period}
        </p>
        <p className="text-gray-700 mb-4 text-sm sm:text-base">{project.summary}</p>
        <ul className="space-y-2 mb-6">
          {project.highlights.map((item) => (
            <li key={item} className="text-gray-600 text-sm flex gap-2">
              <span className="text-blue-500 mt-1 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        {(project.url || hasProjectDetail(project.id)) && (
          <div
            className={`mt-auto pt-6 flex w-full gap-3 ${
              project.url && hasProjectDetail(project.id)
                ? 'flex-row items-center justify-between'
                : 'flex-col sm:flex-row'
            }`}
          >
            {hasProjectDetail(project.id) && (
              <Link
                href={`/projects/${project.id}`}
                className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 font-medium transition min-h-[44px] shrink-0"
              >
                <FaArrowRight className="text-sm" />
                Case study
              </Link>
            )}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition min-h-[44px] ${
                  hasProjectDetail(project.id) ? 'shrink-0 sm:text-right sm:ml-auto' : ''
                }`}
              >
                <FaExternalLinkAlt className="text-sm" />
                Visit {project.name}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
