import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics & Power Platform Projects | Jim Lowry, B.S.',
  description: 'Explore analytics, Power BI, Power Query/M, and Power Platform projects by Jim Lowry. See how data analytics and automation deliver measurable business impact and support continuous learning.',
  keywords: 'analytics projects, Power BI, Power Query, Power Platform, business intelligence, automation, SQL, Tableau, Google Data Studio, Jim Lowry',
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
