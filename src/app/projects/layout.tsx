import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Solutions & Personal Projects | Jim Lowry, B.S.',
  description: 'Explore business solutions that delivered measurable results alongside personal technical projects that demonstrate practical implementation skills and technical versatility.',
  keywords: 'business solution case studies, process automation projects, financial dashboard implementation, technical implementation projects, home automation, networking projects',
  alternates: {
    canonical: 'https://www.lowrys.org/projects'
  }
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
