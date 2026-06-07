import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProjectDetailView from '@/components/ProjectDetailView';
import { getProjectById } from '@/data/portfolio';
import { getProjectDetail, getProjectDetailIds, hasProjectDetail } from '@/data/project-details';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getProjectDetailIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);
  const detail = getProjectDetail(id);

  if (!project || !detail) {
    return { title: 'Project | Jim Lowry' };
  }

  const title = `${project.name} | Jim Lowry`;
  const description = detail.tagline;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.lowrys.org/projects/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.lowrys.org/projects/${id}`,
      type: 'article',
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  if (!hasProjectDetail(id)) {
    notFound();
  }

  const project = getProjectById(id);
  const detail = getProjectDetail(id);

  if (!project || !detail) {
    notFound();
  }

  return <ProjectDetailView project={project} detail={detail} />;
}
